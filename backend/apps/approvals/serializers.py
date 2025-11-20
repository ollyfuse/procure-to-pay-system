from rest_framework import serializers
from .models import Approval
from apps.users.serializers import UserSerializer

class ApprovalSerializer(serializers.ModelSerializer):
    approver_details = UserSerializer(source='approver', read_only=True)
    
    class Meta:
        model = Approval
        fields = [
            'id', 'level', 'action', 'comment', 'created_at',
            'approver', 'approver_details'
        ]
        read_only_fields = ['id', 'created_at', 'approver']

class ApprovalActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=Approval.Action.choices)
    comment = serializers.CharField(required=False, allow_blank=True)
