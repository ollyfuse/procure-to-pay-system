from rest_framework import permissions

class IsStaff(permissions.BasePermission):
    """Permission for staff users only"""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'staff'
        )

class IsApprover(permissions.BasePermission):
    """Permission for approver users only"""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_approver
        )

class IsApproverLevel(permissions.BasePermission):
    """Permission for specific approver level"""
    def __init__(self, level):
        self.level = level
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_approver and
            request.user.approver_level == self.level
        )

class IsFinance(permissions.BasePermission):
    """Permission for finance users only"""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_finance
        )

class CanApproveRequest(permissions.BasePermission):
    """Permission to check if user can approve specific request"""
    def has_object_permission(self, request, view, obj):
        if not request.user.is_approver:
            return False
        
        # Check if user's level matches current approval level needed
        if request.user.role == 'approver_level_1':
            return obj.current_approval_level == 1
        elif request.user.role == 'approver_level_2':
            return obj.current_approval_level == 2
        
        return False
