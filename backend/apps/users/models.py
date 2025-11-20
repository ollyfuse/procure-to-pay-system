import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        STAFF = 'staff', 'Staff'
        APPROVER_LVL_1 = 'approver_level_1', 'Approver Level 1'
        APPROVER_LVL_2 = 'approver_level_2', 'Approver Level 2'
        FINANCE = 'finance', 'Finance'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF
    )
    approver_level = models.PositiveIntegerField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_approver(self):
        return self.role in [self.Role.APPROVER_LVL_1, self.Role.APPROVER_LVL_2]
    
    @property
    def is_finance(self):
        return self.role == self.Role.FINANCE
