import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ProformaMetadata(models.Model):
    class ExtractionStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        PARTIAL = 'partial', 'Partial'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.OneToOneField(
        'requests.PurchaseRequest',
        on_delete=models.CASCADE,
        related_name='proforma_metadata'
    )
    
    # Extracted fields
    vendor_name = models.CharField(max_length=200, blank=True)
    vendor_address = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True)
    payment_terms = models.TextField(blank=True)
    
    # Items as JSON field
    items = models.JSONField(default=list, blank=True)
    
    # Extraction metadata
    extraction_status = models.CharField(
        max_length=20,
        choices=ExtractionStatus.choices,
        default=ExtractionStatus.PENDING
    )
    raw_text = models.TextField(blank=True)  # Store extracted text
    ai_response = models.JSONField(default=dict, blank=True)  # Store full AI response
    error_message = models.TextField(blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Metadata for {self.request.title} - {self.get_extraction_status_display()}"
    
class ReceiptMetadata(models.Model):
    class ValidationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VALID = 'valid', 'Valid'
        DISCREPANCY = 'discrepancy', 'Has Discrepancies'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.OneToOneField(
        'requests.PurchaseRequest',
        on_delete=models.CASCADE,
        related_name='receipt_metadata'
    )
    
    # Extracted receipt data
    vendor_name = models.CharField(max_length=200, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True)
    items = models.JSONField(default=list, blank=True)
    
    # Validation results
    validation_status = models.CharField(
        max_length=20,
        choices=ValidationStatus.choices,
        default=ValidationStatus.PENDING
    )
    discrepancies = models.JSONField(default=list, blank=True)  # List of found issues
    confidence_score = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

