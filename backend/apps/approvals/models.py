import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Approval(models.Model):
    class Action(models.TextChoices):
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        'requests.PurchaseRequest', 
        on_delete=models.CASCADE, 
        related_name='approvals'
    )
    approver = models.ForeignKey(User, on_delete=models.CASCADE)
    level = models.PositiveIntegerField()
    action = models.CharField(max_length=20, choices=Action.choices)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['request', 'level']  # Prevent duplicate approvals at same level

    def __str__(self):
        return f"{self.request.title} - Level {self.level} - {self.get_action_display()}"
