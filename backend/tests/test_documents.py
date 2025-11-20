import os
import tempfile
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch, MagicMock
from apps.requests.models import PurchaseRequest
from apps.documents.models import ProformaMetadata
from apps.documents.utils import DocumentProcessor
from apps.documents.ai_service import AIExtractionService
from decimal import Decimal

User = get_user_model()

class DocumentProcessorTest(TestCase):
    def test_file_validation_success(self):
        """Test successful file validation"""
        # Create a simple PDF-like file
        pdf_content = b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n9\n%%EOF'
        
        uploaded_file = SimpleUploadedFile(
            "test.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        with patch('magic.from_buffer', return_value='application/pdf'):
            result = DocumentProcessor.validate_file(uploaded_file)
            self.assertTrue(result['valid'])
            self.assertEqual(len(result['errors']), 0)

    def test_file_validation_too_large(self):
        """Test file size validation"""
        large_content = b'x' * (DocumentProcessor.MAX_FILE_SIZE + 1)
        
        uploaded_file = SimpleUploadedFile(
            "large.pdf",
            large_content,
            content_type="application/pdf"
        )
        
        with patch('magic.from_buffer', return_value='application/pdf'):
            result = DocumentProcessor.validate_file(uploaded_file)
            self.assertFalse(result['valid'])
            self.assertIn('exceeds maximum', result['errors'][0])

    def test_file_validation_wrong_type(self):
        """Test file type validation"""
        uploaded_file = SimpleUploadedFile(
            "test.txt",
            b"This is a text file",
            content_type="text/plain"
        )
        
        with patch('magic.from_buffer', return_value='text/plain'):
            result = DocumentProcessor.validate_file(uploaded_file)
            self.assertFalse(result['valid'])
            self.assertIn('not allowed', result['errors'][0])

class AIExtractionServiceTest(TestCase):
    def setUp(self):
        self.ai_service = AIExtractionService()

    @patch('openai.OpenAI')
    def test_extract_metadata_success(self, mock_openai):
        """Test successful AI metadata extraction"""
        # Mock OpenAI response
        mock_response = MagicMock()
        mock_response.choices[0].message.content = '''
        {
            "vendor_name": "ABC Office Supplies",
            "vendor_address": "123 Business St, City, State 12345",
            "total_amount": 250.00,
            "currency": "USD",
            "payment_terms": "Net 30",
            "items": [
                {
                    "description": "Office Pens",
                    "quantity": 10,
                    "unit_price": 5.00,
                    "total_price": 50.00
                }
            ]
        }
        '''
        
        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client
        
        # Mock the client initialization
        self.ai_service.client = mock_client
        
        text = "Invoice from ABC Office Supplies for office pens..."
        result = self.ai_service.extract_metadata(text)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['data']['vendor_name'], 'ABC Office Supplies')
        self.assertEqual(result['data']['total_amount'], 250.00)
        self.assertGreater(result['confidence'], 0.8)

    def test_extract_metadata_no_client(self):
        """Test extraction when OpenAI client is not configured"""
        service = AIExtractionService()
        service.client = None
        
        result = service.extract_metadata("Some text")
        
        self.assertFalse(result['success'])
        self.assertIn('not configured', result['error'])

class ProformaUploadAPITest(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff',
            password='testpass123',
            role='staff'
        )
        
        self.request = PurchaseRequest.objects.create(
            title='Test Request',
            description='Test Description',
            total_amount=Decimal('100.00'),
            created_by=self.staff_user
        )

    def test_upload_proforma_success(self):
        """Test successful proforma upload"""
        self.client.force_authenticate(user=self.staff_user)
        
        # Create a test PDF file
        pdf_content = b'%PDF-1.4\nTest PDF content'
        uploaded_file = SimpleUploadedFile(
            "proforma.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        url = reverse('purchaserequest-upload-proforma', kwargs={'pk': self.request.pk})
        
        with patch('apps.documents.utils.DocumentProcessor.validate_file') as mock_validate:
            mock_validate.return_value = {'valid': True, 'errors': [], 'file_type': 'application/pdf'}
            
            with patch('apps.documents.tasks.process_proforma_document.delay') as mock_task:
                mock_task.return_value = MagicMock(id='task-123')
                
                response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('task_id', response.data)

    def test_upload_proforma_invalid_file(self):
        """Test upload with invalid file"""
        self.client.force_authenticate(user=self.staff_user)
        
        uploaded_file = SimpleUploadedFile(
            "test.txt",
            b"This is not a PDF",
            content_type="text/plain"
        )
        
        url = reverse('purchaserequest-upload-proforma', kwargs={'pk': self.request.pk})
        
        with patch('apps.documents.utils.DocumentProcessor.validate_file') as mock_validate:
            mock_validate.return_value = {
                'valid': False, 
                'errors': ['File type text/plain not allowed'],
                'file_type': 'text/plain'
            }
            
            response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_proforma_locked_request(self):
        """Test upload to approved/rejected request"""
        self.request.status = 'approved'
        self.request.save()
        
        self.client.force_authenticate(user=self.staff_user)
        
        uploaded_file = SimpleUploadedFile(
            "proforma.pdf",
            b'%PDF-1.4\nTest PDF content',
            content_type="application/pdf"
        )
        
        url = reverse('purchaserequest-upload-proforma', kwargs={'pk': self.request.pk})
        response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot upload proforma', response.data['error'])

    def test_upload_proforma_permission_denied(self):
        """Test upload by non-staff user"""
        approver = User.objects.create_user(
            username='approver',
            password='testpass123',
            role='approver_level_1'
        )
        
        self.client.force_authenticate(user=approver)
        
        uploaded_file = SimpleUploadedFile(
            "proforma.pdf",
            b'%PDF-1.4\nTest PDF content',
            content_type="application/pdf"
        )
        
        url = reverse('purchaserequest-upload-proforma', kwargs={'pk': self.request.pk})
        response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class ProformaMetadataModelTest(TestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff',
            password='testpass123',
            role='staff'
        )
        
        self.request = PurchaseRequest.objects.create(
            title='Test Request',
            description='Test Description',
            total_amount=Decimal('100.00'),
            created_by=self.staff_user
        )

    def test_create_proforma_metadata(self):
        """Test creating proforma metadata"""
        metadata = ProformaMetadata.objects.create(
            request=self.request,
            vendor_name='Test Vendor',
            vendor_address='123 Test St',
            total_amount=Decimal('150.00'),
            currency='USD',
            payment_terms='Net 30',
            items=[
                {
                    'description': 'Test Item',
                    'quantity': 1,
                    'unit_price': 150.00,
                    'total_price': 150.00
                }
            ],
            extraction_status='success',
            confidence_score=0.95
        )
        
        self.assertEqual(metadata.vendor_name, 'Test Vendor')
        self.assertEqual(metadata.extraction_status, 'success')
        self.assertEqual(metadata.confidence_score, 0.95)
        self.assertEqual(len(metadata.items), 1)

    def test_proforma_metadata_str(self):
        """Test string representation"""
        metadata = ProformaMetadata.objects.create(
            request=self.request,
            extraction_status='success'
        )
        
        expected = f"Metadata for {self.request.title} - Success"
        self.assertEqual(str(metadata), expected)

class DocumentProcessingIntegrationTest(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff',
            password='testpass123',
            role='staff'
        )
        
        self.request = PurchaseRequest.objects.create(
            title='Integration Test Request',
            description='Test Description',
            total_amount=Decimal('200.00'),
            created_by=self.staff_user
        )

    @patch('apps.documents.tasks.process_proforma_document.delay')
    def test_full_upload_workflow(self, mock_task):
        """Test complete upload workflow"""
        mock_task.return_value = MagicMock(id='task-456')
        
        self.client.force_authenticate(user=self.staff_user)
        
        pdf_content = b'%PDF-1.4\nInvoice from XYZ Corp\nTotal: $200.00'
        uploaded_file = SimpleUploadedFile(
            "invoice.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        url = reverse('purchaserequest-upload-proforma', kwargs={'pk': self.request.pk})
        
        with patch('apps.documents.utils.DocumentProcessor.validate_file') as mock_validate:
            mock_validate.return_value = {'valid': True, 'errors': [], 'file_type': 'application/pdf'}
            
            response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        
        # Verify task was called
        mock_task.assert_called_once()
        
        # Verify file was saved to request
        self.request.refresh_from_db()
        self.assertTrue(self.request.proforma_file)
