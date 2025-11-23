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
from apps.notifications.tasks import send_approval_notification, send_clarification_request, send_receipt_reminder, send_finance_notification
from apps.users.permissions import IsStaff, IsApprover, CanApproveRequest, IsFinance


class PurchaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Staff can only see their own requests
        if user.role == 'staff':
            return PurchaseRequest.objects.filter(created_by=user)
        
        # Approvers see pending requests for their level + requests they can view for detail
        elif user.is_approver:
            if self.action == 'my_approvals':
                # For approval history, only show requests where user has made a decision
                return PurchaseRequest.objects.filter(
                    approvals__approver=user
                ).distinct().order_by('-updated_at')
            elif self.action == 'retrieve':
                # For detail view, show any request they have permission to see
                if user.role == 'approver_level_1':
                    return PurchaseRequest.objects.filter(
                        Q(current_approval_level=1) | 
                        Q(approvals__approver=user)
                    ).distinct()
                elif user.role == 'approver_level_2':
                    return PurchaseRequest.objects.filter(
                        Q(current_approval_level=2) | 
                        Q(approvals__approver=user)
                    ).distinct()
            else:
                # For list view, only show pending requests for their level
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

   
    @action(detail=False, methods=['get'])
    def my_approvals(self, request):
        """Get requests that the current user has approved/rejected"""
        user = request.user
        
        if not user.is_approver:
            return Response({'error': 'Only approvers can access this endpoint'}, 
                        status=status.HTTP_403_FORBIDDEN)
        
        # Get only requests where user has actually made an approval decision
        # This bypasses get_queryset() to avoid any interference
        approved_requests = PurchaseRequest.objects.filter(
            approvals__approver=user
        ).distinct().order_by('-updated_at')
        
        serializer = self.get_serializer(approved_requests, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsStaff]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        elif self.action in ['approve', 'reject', 'request_clarification']:
            permission_classes = [permissions.IsAuthenticated, IsApprover, CanApproveRequest]
        elif self.action in ['upload_proforma', 'upload_receipt', 'respond_to_clarification']:
            permission_classes = [permissions.IsAuthenticated, IsStaff, IsOwnerOrReadOnly]
        elif self.action == 'update_payment_status':
            permission_classes = [permissions.IsAuthenticated, IsFinance]
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
        
        # Create approval record (ONLY ONCE)
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
            if purchase_request.is_fully_approved:
                purchase_request.status = PurchaseRequest.Status.APPROVED
                self._create_purchase_order(purchase_request)
                send_finance_notification.delay(str(purchase_request.id))
            else:
                purchase_request.current_approval_level = purchase_request.next_approval_level
        
        # Increment version for optimistic locking
        purchase_request.version += 1
        purchase_request.save()

        # Send notification to requester
        send_approval_notification.delay(
            str(purchase_request.id), 
            action, 
            request.user.get_full_name() or request.user.username
        )
        
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

    @action(detail=True, methods=['post'])
    def request_clarification(self, request, pk=None):
        """Approver requests more information"""
        purchase_request = self.get_object()
        
        if not request.user.is_approver:
            return Response({'error': 'Only approvers can request clarification'}, 
                        status=status.HTTP_403_FORBIDDEN)
        
        message = request.data.get('message', '')
        if not message:
            return Response({'error': 'Clarification message is required'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Update request status
        purchase_request.status = PurchaseRequest.Status.NEED_INFO
        purchase_request.clarification_requested = True
        purchase_request.clarification_message = message
        purchase_request.save()
        
        # Send notification
        send_clarification_request.delay(str(purchase_request.id), message)
        
        return Response({
            'message': 'Clarification requested successfully',
            'status': purchase_request.status
        })

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_receipt(self, request, pk=None):
        """Upload and validate receipt against PO"""
        purchase_request = self.get_object()
        
        # Check ownership
        if purchase_request.created_by != request.user:
            return Response({'error': 'You can only upload receipts for your own requests'}, 
                        status=status.HTTP_403_FORBIDDEN)
        
        # Check if paid
        if purchase_request.payment_status != PurchaseRequest.PaymentStatus.PAID:
            return Response({'error': 'Can only upload receipts for paid requests'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Check if PO exists
        if not hasattr(purchase_request, 'purchase_order'):
            return Response({'error': 'No PO found for this request'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        if 'receipt' not in request.FILES:
            return Response({'error': 'Receipt file required'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Save receipt file
        receipt_file = request.FILES['receipt']
        file_path = f'receipts/{purchase_request.id}/{receipt_file.name}'
        saved_path = default_storage.save(file_path, receipt_file)
        
        purchase_request.receipt_file = saved_path
        purchase_request.receipt_submitted = True
        purchase_request.save()
        
        # Start validation process
        from apps.documents.tasks import process_receipt_validation
        task = process_receipt_validation.delay(str(purchase_request.id))
        
        return Response({
            'message': 'Receipt uploaded and validation started',
            'file_path': saved_path,
            'task_id': task.id
        })

    @action(detail=True, methods=['patch'], parser_classes=[MultiPartParser, FormParser])
    def update_payment_status(self, request, pk=None):
        """Finance updates payment status"""
        purchase_request = self.get_object()
        
        if not request.user.is_finance:
            return Response({'error': 'Only finance team can update payment status'}, 
                        status=status.HTTP_403_FORBIDDEN)
        
        payment_status = request.data.get('payment_status')
        if payment_status not in [choice[0] for choice in PurchaseRequest.PaymentStatus.choices]:
            return Response({'error': 'Invalid payment status'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        purchase_request.payment_status = payment_status
        
        # Handle payment proof upload
        if 'payment_proof' in request.FILES:
            proof_file = request.FILES['payment_proof']
            file_path = f'payment_proofs/{purchase_request.id}/{proof_file.name}'
            saved_path = default_storage.save(file_path, proof_file)
            purchase_request.payment_proof = saved_path
        
        purchase_request.save()
        
        # Send receipt reminder if paid
        if payment_status == PurchaseRequest.PaymentStatus.PAID and purchase_request.receipt_required:
            send_receipt_reminder.delay(str(purchase_request.id))
        
        return Response({
            'message': 'Payment status updated successfully',
            'payment_status': purchase_request.payment_status
        })

    @action(detail=True, methods=['post'])
    def respond_to_clarification(self, request, pk=None):
        """Staff responds to clarification request"""
        purchase_request = self.get_object()
        
        if purchase_request.created_by != request.user:
            return Response({'error': 'You can only respond to your own requests'}, 
                        status=status.HTTP_403_FORBIDDEN)
        
        if not purchase_request.clarification_requested:
            return Response({'error': 'No clarification was requested for this request'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        response_message = request.data.get('response', '')
        if not response_message:
            return Response({'error': 'Response message is required'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Update request
        purchase_request.clarification_response = response_message
        purchase_request.clarification_requested = False
        purchase_request.status = PurchaseRequest.Status.PENDING
        purchase_request.save()
        
        return Response({
            'message': 'Response submitted successfully',
            'status': purchase_request.status
        })

