from rest_framework import serializers
from .models import PurchaseOrder

class PurchaseOrderSerializer(serializers.ModelSerializer):
    request_title = serializers.CharField(source='request.title', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'request', 'request_title', 'vendor_name',
            'total_amount', 'items', 'po_document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'po_number', 'created_at', 'updated_at', 'request_title']
