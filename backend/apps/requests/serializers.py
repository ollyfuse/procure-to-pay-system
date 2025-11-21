from rest_framework import serializers
from .models import PurchaseRequest, RequestItem
from apps.approvals.serializers import ApprovalSerializer
from apps.po.models import PurchaseOrder
from apps.documents.serializers import ProformaMetadataSerializer

class RequestItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'total_price']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'po_number', 'vendor_name', 'total_amount', 'items', 'created_at']
        read_only_fields = ['id', 'po_number', 'created_at']

class PurchaseRequestSerializer(serializers.ModelSerializer):
    items = RequestItemSerializer(many=True, required=False)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    approvals = ApprovalSerializer(many=True, read_only=True)
    purchase_order = PurchaseOrderSerializer(read_only=True)
    proforma_metadata = ProformaMetadataSerializer(read_only=True)
    
    # Computed fields
    is_locked = serializers.BooleanField(read_only=True)
    next_approval_level = serializers.IntegerField(read_only=True)
    is_fully_approved = serializers.BooleanField(read_only=True)
    
    # File fields
    proforma_file_url = serializers.SerializerMethodField()
    receipt_file_url = serializers.SerializerMethodField()
    payment_proof_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseRequest
        fields = [
            'id', 'title', 'description', 'total_amount', 'status',
            'current_approval_level', 'created_by', 'created_by_username',
            'proforma_file', 'proforma_file_url', 'purchase_order_file', 
            'receipt_file', 'receipt_file_url', 'payment_proof', 'payment_proof_url',
            'payment_status', 'receipt_required', 'receipt_submitted',
            'clarification_requested', 'clarification_message', 'clarification_response',
            'version', 'created_at', 'updated_at', 'items', 'approvals',
            'purchase_order', 'proforma_metadata', 'is_locked', 'next_approval_level', 'is_fully_approved'
        ]
        read_only_fields = [
            'id', 'status', 'created_by', 'created_by_username',
            'purchase_order_file', 'version', 'created_at', 'updated_at',
            'approvals', 'purchase_order', 'proforma_metadata', 'is_locked', 
            'next_approval_level', 'is_fully_approved', 'proforma_file_url',
            'receipt_file_url', 'payment_proof_url'
        ]

    def get_proforma_file_url(self, obj):
        """Get URL for proforma file"""
        if obj.proforma_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.proforma_file.url)
            return obj.proforma_file.url
        return None

    def get_receipt_file_url(self, obj):
        """Get URL for receipt file"""
        if obj.receipt_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_file.url)
            return obj.receipt_file.url
        return None

    def get_payment_proof_url(self, obj):
        """Get URL for payment proof file"""
        if obj.payment_proof:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.payment_proof.url)
            return obj.payment_proof.url
        return None

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = PurchaseRequest.objects.create(**validated_data)
        
        for item_data in items_data:
            RequestItem.objects.create(request=request, **item_data)
        
        return request

    def update(self, instance, validated_data):
        # Only allow updates if status is PENDING
        if instance.is_locked:
            raise serializers.ValidationError("Cannot update request that is approved or rejected")
        
        items_data = validated_data.pop('items', [])
        
        # Update request fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items (simple approach: delete and recreate)
        if items_data:
            instance.items.all().delete()
            for item_data in items_data:
                RequestItem.objects.create(request=instance, **item_data)
        
        return instance
