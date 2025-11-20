from rest_framework import serializers
from .models import ProformaMetadata

class ProformaMetadataSerializer(serializers.ModelSerializer):
    extraction_status_display = serializers.CharField(source='get_extraction_status_display', read_only=True)
    
    class Meta:
        model = ProformaMetadata
        fields = [
            'id', 'vendor_name', 'vendor_address', 'total_amount', 'currency',
            'payment_terms', 'items', 'extraction_status', 'extraction_status_display',
            'confidence_score', 'error_message', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'extraction_status', 'confidence_score', 'error_message',
            'created_at', 'updated_at'
        ]

class ProformaUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, value):
        """Validate uploaded file"""
        from .utils import DocumentProcessor
        
        validation_result = DocumentProcessor.validate_file(value)
        
        if not validation_result['valid']:
            raise serializers.ValidationError(validation_result['errors'])
        
        return value
