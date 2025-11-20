from django.contrib import admin
from .models import ProformaMetadata

@admin.register(ProformaMetadata)
class ProformaMetadataAdmin(admin.ModelAdmin):
    list_display = [
        'request', 'vendor_name', 'total_amount', 'currency', 
        'extraction_status', 'confidence_score', 'created_at'
    ]
    list_filter = ['extraction_status', 'currency', 'created_at']
    search_fields = ['request__title', 'vendor_name', 'vendor_address']
    readonly_fields = [
        'id', 'extraction_status', 'confidence_score', 'raw_text', 
        'ai_response', 'error_message', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Request Information', {
            'fields': ('request', 'extraction_status', 'confidence_score')
        }),
        ('Extracted Vendor Data', {
            'fields': ('vendor_name', 'vendor_address', 'payment_terms')
        }),
        ('Financial Data', {
            'fields': ('total_amount', 'currency', 'items')
        }),
        ('Processing Details', {
            'fields': ('raw_text', 'ai_response', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return self.readonly_fields + ['request']
        return self.readonly_fields
