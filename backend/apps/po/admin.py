from django.contrib import admin
from .models import PurchaseOrder

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['po_number', 'request', 'vendor_name', 'total_amount', 'created_at']
    list_filter = ['created_at', 'vendor_name']
    search_fields = ['po_number', 'request__title', 'vendor_name']
    readonly_fields = ['id', 'po_number', 'created_at', 'updated_at']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return self.readonly_fields + ['request']
        return self.readonly_fields
