from rest_framework import viewsets, permissions
from .models import PurchaseOrder
from .serializers import PurchaseOrderSerializer
from apps.users.permissions import IsFinance

class PurchaseOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Finance users can view purchase orders
    """
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsFinance]
    
    def get_queryset(self):
        return PurchaseOrder.objects.all().select_related('request')
