from django.contrib import admin
# Register your models here.
from django.contrib import admin
from .models import Approval

@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = ['request', 'approver', 'level', 'action', 'created_at']
    list_filter = ['action', 'level', 'created_at']
    search_fields = ['request__title', 'approver__username', 'comment']
    readonly_fields = ['id', 'created_at']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object - make most fields readonly
            return self.readonly_fields + ['request', 'approver', 'level', 'action']
        return self.readonly_fields
