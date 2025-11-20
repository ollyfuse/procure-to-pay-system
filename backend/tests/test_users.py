from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='staff'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.role, 'staff')
        self.assertFalse(user.is_approver)
        self.assertFalse(user.is_finance)

    def test_approver_properties(self):
        user = User.objects.create_user(
            username='approver',
            password='testpass123',
            role='approver_level_1'
        )
        self.assertTrue(user.is_approver)
        self.assertFalse(user.is_finance)

class AuthAPITest(APITestCase):
    def test_register_user(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'role': 'staff'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login_user(self):
        # Create user
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='staff'
        )
        
        # Login
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
