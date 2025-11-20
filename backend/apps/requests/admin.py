from django.contrib import admin
from .models import PurchaseRequest, RequestItem

class RequestItemInline(admin.TabularInline):
    model = RequestItem
    extra = 1

@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at', 'version']
    inlines = [RequestItemInline]

@admin.register(RequestItem)
class RequestItemAdmin(admin.ModelAdmin):
    list_display = ['description', 'request', 'quantity', 'unit_price', 'total_price']
    list_filter = ['request__status']
