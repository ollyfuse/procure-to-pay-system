from rest_framework import serializers
from .models import PurchaseRequest, RequestItem
from apps.approvals.serializers import ApprovalSerializer
from apps.po.models import PurchaseOrder

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
    
    # Computed fields
    is_locked = serializers.BooleanField(read_only=True)
    next_approval_level = serializers.IntegerField(read_only=True)
    is_fully_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PurchaseRequest
        fields = [
            'id', 'title', 'description', 'total_amount', 'status',
            'current_approval_level', 'created_by', 'created_by_username',
            'proforma_file', 'purchase_order_file', 'receipt_file',
            'version', 'created_at', 'updated_at', 'items', 'approvals',
            'purchase_order', 'is_locked', 'next_approval_level', 'is_fully_approved'
        ]
        read_only_fields = [
            'id', 'status', 'created_by', 'created_by_username',
            'purchase_order_file', 'version', 'created_at', 'updated_at',
            'approvals', 'purchase_order', 'is_locked', 'next_approval_level', 'is_fully_approved'
        ]

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
