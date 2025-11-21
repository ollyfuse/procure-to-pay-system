import uuid
from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

class PurchaseRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        NEED_INFO = 'need_info', 'Need More Information'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending Payment'
        PAID = 'paid', 'Paid'
        PARTIALLY_PAID = 'partially_paid', 'Partially Paid'
        ON_HOLD = 'on_hold', 'On Hold'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchase_requests')
    current_approval_level = models.PositiveIntegerField(default=1)
    
    # File fields
    proforma_file = models.FileField(upload_to='proformas/', null=True, blank=True)
    purchase_order_file = models.FileField(upload_to='purchase_orders/', null=True, blank=True)
    receipt_file = models.FileField(upload_to='receipts/', null=True, blank=True)
    
    # Payment fields
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    payment_proof = models.FileField(upload_to='payment_proofs/', null=True, blank=True)
    receipt_required = models.BooleanField(default=True)
    receipt_submitted = models.BooleanField(default=False)
    
    # Clarification fields
    clarification_requested = models.BooleanField(default=False)
    clarification_message = models.TextField(blank=True)
    clarification_response = models.TextField(blank=True)
    
    # Optimistic locking
    version = models.PositiveIntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    @property
    def is_locked(self):
        """Request is locked if approved or rejected"""
        return self.status in [self.Status.APPROVED, self.Status.REJECTED]

    @property
    def required_approval_levels(self):
        """Define required approval levels based on amount or other criteria"""
        # Simple rule: all requests need level 1 and 2 approval
        return [1, 2]

    @property
    def next_approval_level(self):
        """Get the next required approval level"""
        approved_levels = set(self.approvals.filter(action='approved').values_list('level', flat=True))
        required_levels = set(self.required_approval_levels)
        pending_levels = required_levels - approved_levels
        
        if pending_levels:
            return min(pending_levels)
        return None

    @property
    def is_fully_approved(self):
        """Check if all required approvals are complete"""
        approved_levels = set(self.approvals.filter(action='approved').values_list('level', flat=True))
        required_levels = set(self.required_approval_levels)
        return required_levels.issubset(approved_levels)

class RequestItem(models.Model):
    request = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        # Auto-calculate total_price
        self.total_price = Decimal(str(self.quantity)) * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} (x{self.quantity})"
