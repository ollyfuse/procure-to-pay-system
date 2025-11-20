import uuid
from django.db import models
from decimal import Decimal

class PurchaseOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.OneToOneField(
        'requests.PurchaseRequest',
        on_delete=models.CASCADE,
        related_name='purchase_order'
    )
    po_number = models.CharField(max_length=50, unique=True)
    vendor_name = models.CharField(max_length=200, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # JSON field for items (simple approach for Sprint 2)
    items = models.JSONField(default=list)
    
    # File will be generated in later sprints
    po_document = models.FileField(upload_to='purchase_orders/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.po_number:
            # Generate PO number: PO-YYYY-NNNNNN
            from django.utils import timezone
            year = timezone.now().year
            last_po = PurchaseOrder.objects.filter(
                po_number__startswith=f'PO-{year}-'
            ).order_by('-po_number').first()
            
            if last_po:
                last_num = int(last_po.po_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.po_number = f'PO-{year}-{new_num:06d}'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.po_number} - {self.request.title}"
