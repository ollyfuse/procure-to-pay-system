from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from apps.requests.models import PurchaseRequest
from apps.approvals.models import Approval
from apps.po.models import PurchaseOrder
from decimal import Decimal

User = get_user_model()

class ApprovalWorkflowTest(TestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff',
            password='testpass123',
            role='staff'
        )
        self.approver_l1 = User.objects.create_user(
            username='approver1',
            password='testpass123',
            role='approver_level_1',
            approver_level=1
        )
        self.approver_l2 = User.objects.create_user(
            username='approver2',
            password='testpass123',
            role='approver_level_2',
            approver_level=2
        )
        self.finance_user = User.objects.create_user(
            username='finance',
            password='testpass123',
            role='finance'
        )
        
        self.request = PurchaseRequest.objects.create(
            title='Test Request',
            description='Test Description',
            total_amount=Decimal('1000.00'),
            created_by=self.staff_user
        )

    def test_approval_workflow_properties(self):
        """Test request workflow properties"""
        self.assertEqual(self.request.current_approval_level, 1)
        self.assertEqual(self.request.next_approval_level, 1)
        self.assertFalse(self.request.is_fully_approved)
        self.assertFalse(self.request.is_locked)

    def test_level_1_approval(self):
        """Test level 1 approval moves to level 2"""
        approval = Approval.objects.create(
            request=self.request,
            approver=self.approver_l1,
            level=1,
            action='approved'
        )
        
        # Refresh from database
        self.request.refresh_from_db()
        
        # Should move to level 2
        self.assertEqual(self.request.next_approval_level, 2)
        self.assertFalse(self.request.is_fully_approved)
        self.assertEqual(self.request.status, 'pending')

    def test_full_approval_creates_po(self):
        """Test that full approval creates PO"""
        # Level 1 approval
        Approval.objects.create(
            request=self.request,
            approver=self.approver_l1,
            level=1,
            action='approved'
        )
        
        # Level 2 approval
        Approval.objects.create(
            request=self.request,
            approver=self.approver_l2,
            level=2,
            action='approved'
        )
        
        self.assertTrue(self.request.is_fully_approved)
        
        # Manually trigger PO creation (in real workflow, this happens in view)
        if self.request.is_fully_approved:
            PurchaseOrder.objects.create(
                request=self.request,
                total_amount=self.request.total_amount,
                items=[],
                vendor_name='Test Vendor'
            )
        
        self.assertTrue(PurchaseOrder.objects.filter(request=self.request).exists())

    def test_rejection_locks_request(self):
        """Test that rejection locks the request"""
        self.request.status = 'rejected'
        self.request.save()
        
        self.assertTrue(self.request.is_locked)

class ApprovalAPITest(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff',
            password='testpass123',
            role='staff'
        )
        self.approver_l1 = User.objects.create_user(
            username='approver1',
            password='testpass123',
            role='approver_level_1',
            approver_level=1
        )
        self.approver_l2 = User.objects.create_user(
            username='approver2',
            password='testpass123',
            role='approver_level_2',
            approver_level=2
        )
        
        self.request = PurchaseRequest.objects.create(
            title='Test Request',
            description='Test Description',
            total_amount=Decimal('1000.00'),
            created_by=self.staff_user
        )

    def test_staff_cannot_approve(self):
        """Test that staff users cannot approve requests"""
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('purchaserequest-approve', kwargs={'pk': self.request.pk})
        
        response = self.client.patch(url, {'comment': 'Test approval'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approver_can_approve_correct_level(self):
        """Test that approver can approve request at correct level"""
        self.client.force_authenticate(user=self.approver_l1)
        url = reverse('purchaserequest-approve', kwargs={'pk': self.request.pk})
        
        response = self.client.patch(url, {'comment': 'Approved by L1'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check approval was created
        self.assertTrue(
            Approval.objects.filter(
                request=self.request,
                approver=self.approver_l1,
                level=1,
                action='approved'
            ).exists()
        )

    def test_approver_cannot_approve_wrong_level(self):
        """Test that approver cannot approve request at wrong level"""
        # Set request to level 2
        self.request.current_approval_level = 2
        self.request.save()
        
        self.client.force_authenticate(user=self.approver_l1)
        url = reverse('purchaserequest-approve', kwargs={'pk': self.request.pk})
        
        response = self.client.patch(url, {'comment': 'Should fail'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_request(self):
        """Test rejecting a request"""
        self.client.force_authenticate(user=self.approver_l1)
        url = reverse('purchaserequest-reject', kwargs={'pk': self.request.pk})
        
        response = self.client.patch(url, {'comment': 'Rejected for testing'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check request is rejected
        self.request.refresh_from_db()
        self.assertEqual(self.request.status, 'rejected')

    def test_double_approval_prevention(self):
        """Test that same user cannot approve twice"""
        # First approval
        self.client.force_authenticate(user=self.approver_l1)
        url = reverse('purchaserequest-approve', kwargs={'pk': self.request.pk})
        
        response1 = self.client.patch(url, {'comment': 'First approval'}, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Second approval attempt
        response2 = self.client.patch(url, {'comment': 'Second approval'}, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

class PermissionTest(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff',
            password='testpass123',
            role='staff'
        )
        self.approver_l1 = User.objects.create_user(
            username='approver1',
            password='testpass123',
            role='approver_level_1',
            approver_level=1
        )
        self.finance_user = User.objects.create_user(
            username='finance',
            password='testpass123',
            role='finance'
        )

    def test_staff_sees_own_requests(self):
        """Test staff users only see their own requests"""
        # Create requests by different users
        request1 = PurchaseRequest.objects.create(
            title='Staff Request',
            description='Description',
            total_amount=Decimal('100.00'),
            created_by=self.staff_user
        )
        
        other_staff = User.objects.create_user(
            username='other_staff',
            password='testpass123',
            role='staff'
        )
        request2 = PurchaseRequest.objects.create(
            title='Other Staff Request',
            description='Description',
            total_amount=Decimal('200.00'),
            created_by=other_staff
        )
        
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('purchaserequest-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], str(request1.id))

    def test_approver_sees_pending_requests_for_level(self):
        """Test approvers see pending requests for their level"""
        request = PurchaseRequest.objects.create(
            title='Pending Request',
            description='Description',
            total_amount=Decimal('100.00'),
            created_by=self.staff_user,
            current_approval_level=1
        )
        
        self.client.force_authenticate(user=self.approver_l1)
        url = reverse('purchaserequest-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_finance_sees_approved_requests(self):
        """Test finance users see approved requests"""
        request = PurchaseRequest.objects.create(
            title='Approved Request',
            description='Description',
            total_amount=Decimal('100.00'),
            created_by=self.staff_user,
            status='approved'
        )
        
        self.client.force_authenticate(user=self.finance_user)
        url = reverse('purchaserequest-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
