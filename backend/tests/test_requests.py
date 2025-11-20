from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from apps.requests.models import PurchaseRequest, RequestItem
from decimal import Decimal

User = get_user_model()

class PurchaseRequestModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='staff'
        )

    def test_create_purchase_request(self):
        request = PurchaseRequest.objects.create(
            title='Test Request',
            description='Test Description',
            total_amount=Decimal('100.00'),
            created_by=self.user
        )
        self.assertEqual(request.title, 'Test Request')
        self.assertEqual(request.status, 'pending')
        self.assertEqual(request.created_by, self.user)

    def test_request_item_total_calculation(self):
        request = PurchaseRequest.objects.create(
            title='Test Request',
            description='Test Description',
            total_amount=Decimal('100.00'),
            created_by=self.user
        )
        
        item = RequestItem.objects.create(
            request=request,
            description='Test Item',
            quantity=2,
            unit_price=Decimal('50.00')
        )
        
        self.assertEqual(item.total_price, Decimal('100.00'))

class PurchaseRequestAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='staff'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_purchase_request(self):
        url = reverse('purchaserequest-list')
        data = {
            'title': 'New Request',
            'description': 'New Description',
            'total_amount': '150.00',
            'items': [
                {
                    'description': 'Item 1',
                    'quantity': 1,
                    'unit_price': '150.00'
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PurchaseRequest.objects.count(), 1)

    def test_list_own_requests(self):
        # Create request
        PurchaseRequest.objects.create(
            title='My Request',
            description='My Description',
            total_amount=Decimal('100.00'),
            created_by=self.user
        )
        
        url = reverse('purchaserequest-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_cannot_update_non_pending_request(self):
        request = PurchaseRequest.objects.create(
            title='Test Request',
            description='Test Description',
            total_amount=Decimal('100.00'),
            created_by=self.user,
            status='approved'
        )
        
        url = reverse('purchaserequest-detail', kwargs={'pk': request.pk})
        data = {'title': 'Updated Title'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
