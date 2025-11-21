# Complete apps/notifications/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

@shared_task
def send_approval_notification(request_id, action, approver_name):
    """Send email when request is approved/rejected"""
    from apps.requests.models import PurchaseRequest
    
    try:
        request_obj = PurchaseRequest.objects.get(id=request_id)
        user_email = request_obj.created_by.email
        
        subject = f'Purchase Request {action.title()}: {request_obj.title}'
        
        if action == 'approved':
            if request_obj.status == 'approved':
                message = f'Your purchase request "{request_obj.title}" has been fully approved and is now ready for payment processing.'
            else:
                message = f'Your purchase request "{request_obj.title}" has been approved at level {approver_name} and moved to the next approval level.'
        else:
            message = f'Your purchase request "{request_obj.title}" has been rejected by {approver_name}.'
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        
    except Exception as e:
        print(f"Failed to send approval notification: {e}")

@shared_task
def send_clarification_request(request_id, message):
    """Send email when clarification is requested"""
    from apps.requests.models import PurchaseRequest
    
    try:
        request_obj = PurchaseRequest.objects.get(id=request_id)
        user_email = request_obj.created_by.email
        
        subject = f'Clarification Needed: {request_obj.title}'
        email_message = f'''
Your purchase request "{request_obj.title}" requires additional information.

Message from approver:
{message}

Please log in to the system to provide the requested information.
        '''
        
        send_mail(
            subject=subject,
            message=email_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        
    except Exception as e:
        print(f"Failed to send clarification request: {e}")

@shared_task
def send_receipt_reminder(request_id):
    """Send receipt submission reminder"""
    from apps.requests.models import PurchaseRequest
    
    try:
        request_obj = PurchaseRequest.objects.get(id=request_id)
        user_email = request_obj.created_by.email
        
        subject = f'Receipt Required: {request_obj.title}'
        message = f'''
Your purchase request "{request_obj.title}" has been paid.

Please submit your receipt by logging into the system and uploading the receipt document.
        '''
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        
    except Exception as e:
        print(f"Failed to send receipt reminder: {e}")

@shared_task
def send_finance_notification(request_id):
    """Notify finance team when request is ready for payment"""
    from apps.requests.models import PurchaseRequest
    from apps.users.models import User
    
    try:
        request_obj = PurchaseRequest.objects.get(id=request_id)
        finance_users = User.objects.filter(role='finance')
        
        subject = f'Ready for Payment: {request_obj.title}'
        message = f'''
Purchase request "{request_obj.title}" has been fully approved and is ready for payment processing.

Amount: ${request_obj.total_amount}
Requester: {request_obj.created_by.get_full_name() or request_obj.created_by.username}
        '''
        
        finance_emails = [user.email for user in finance_users if user.email]
        
        if finance_emails:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=finance_emails,
                fail_silently=False,
            )
        
    except Exception as e:
        print(f"Failed to send finance notification: {e}")
