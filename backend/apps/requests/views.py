from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.db import transaction
from django.db.models import Q
from .models import PurchaseRequest
from .serializers import PurchaseRequestSerializer
from .permissions import IsOwnerOrReadOnly
from apps.users.permissions import IsStaff, IsApprover, CanApproveRequest
from apps.approvals.models import Approval
from apps.approvals.serializers import ApprovalActionSerializer
from apps.po.models import PurchaseOrder
from apps.documents.serializers import ProformaUploadSerializer
from apps.documents.tasks import process_proforma_document

class PurchaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Staff can only see their own requests
        if user.role == 'staff':
            return PurchaseRequest.objects.filter(created_by=user)
        
        # Approvers see pending requests for their level
        elif user.is_approver:
            if user.role == 'approver_level_1':
                return PurchaseRequest.objects.filter(
                    status='pending',
                    current_approval_level=1
                )
            elif user.role == 'approver_level_2':
                return PurchaseRequest.objects.filter(
                    status='pending',
                    current_approval_level=2
                )
        
        # Finance can see approved requests
        elif user.is_finance:
            return PurchaseRequest.objects.filter(status='approved')
        
        return PurchaseRequest.objects.none()
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsStaff]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        elif self.action in ['approve', 'reject']:
            permission_classes = [permissions.IsAuthenticated, IsApprover, CanApproveRequest]
        elif self.action == 'upload_proforma':
            permission_classes = [permissions.IsAuthenticated, IsStaff, IsOwnerOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    
    def perform_create(self, serializer):
        """Set the created_by field to the current user"""
        serializer.save(created_by=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Override update to check if request is still pending"""
        instance = self.get_object()
        
        if instance.is_locked:
            return Response(
                {'error': 'Cannot update request that is approved or rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_proforma(self, request, pk=None):
        """Upload proforma document for processing"""
        purchase_request = self.get_object()
        
        # Check if request is still editable
        if purchase_request.is_locked:
            return Response(
                {'error': 'Cannot upload proforma for approved or rejected request'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file
        serializer = ProformaUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = serializer.validated_data['file']
        
        try:
            # Save file
            file_path = f'proformas/{purchase_request.id}/{uploaded_file.name}'
            saved_path = default_storage.save(file_path, uploaded_file)
            
            # Update request with file path
            purchase_request.proforma_file = saved_path
            purchase_request.save()
            
            # Start async processing
            task = process_proforma_document.delay(
                str(purchase_request.id),
                saved_path
            )
            
            return Response({
                'status': 'success',
                'message': 'Proforma uploaded successfully. Processing started.',
                'file_path': saved_path,
                'task_id': task.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'File upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Approve a purchase request"""
        return self._handle_approval_action(request, pk, 'approved')
    
    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """Reject a purchase request"""
        return self._handle_approval_action(request, pk, 'rejected')
    
    @transaction.atomic
    def _handle_approval_action(self, request, pk, action):
        """Handle approval/rejection with proper locking and workflow"""
        # Get request with SELECT FOR UPDATE to prevent race conditions
        try:
            purchase_request = PurchaseRequest.objects.select_for_update().get(pk=pk)
        except PurchaseRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if request is already processed
        if purchase_request.is_locked:
            return Response(
                {'error': 'Request is already approved or rejected'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Validate user can approve at current level
        user_level = 1 if request.user.role == 'approver_level_1' else 2
        if purchase_request.current_approval_level != user_level:
            return Response(
                {'error': f'Request is not at approval level {user_level}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already approved/rejected this request
        existing_approval = Approval.objects.filter(
            request=purchase_request,
            approver=request.user,
            level=user_level
        ).first()
        
        if existing_approval:
            return Response(
                {'error': 'You have already processed this request'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Validate serializer
        serializer = ApprovalActionSerializer(data={'action': action, **request.data})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create approval record
        approval = Approval.objects.create(
            request=purchase_request,
            approver=request.user,
            level=user_level,
            action=action,
            comment=serializer.validated_data.get('comment', '')
        )
        
        # Update request based on action
        if action == 'rejected':
            purchase_request.status = PurchaseRequest.Status.REJECTED
        elif action == 'approved':
            # Check if this is the final approval
            if purchase_request.is_fully_approved:
                purchase_request.status = PurchaseRequest.Status.APPROVED
                # Create PO
                self._create_purchase_order(purchase_request)
            else:
                # Move to next approval level
                purchase_request.current_approval_level = purchase_request.next_approval_level
        
        # Increment version for optimistic locking
        purchase_request.version += 1
        purchase_request.save()
        
        return Response({
            'message': f'Request {action} successfully',
            'approval_id': approval.id,
            'request_status': purchase_request.status,
            'current_level': purchase_request.current_approval_level
        })
    
    def _create_purchase_order(self, purchase_request):
        """Create a purchase order for approved request"""
        # Convert request items to JSON for PO
        items_data = []
        for item in purchase_request.items.all():
            items_data.append({
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': str(item.unit_price),
                'total_price': str(item.total_price)
            })
        
        # Use proforma metadata if available
        vendor_name = 'TBD'
        if hasattr(purchase_request, 'proforma_metadata'):
            metadata = purchase_request.proforma_metadata
            if metadata.vendor_name:
                vendor_name = metadata.vendor_name
        
        PurchaseOrder.objects.create(
            request=purchase_request,
            total_amount=purchase_request.total_amount,
            items=items_data,
            vendor_name=vendor_name
        )
