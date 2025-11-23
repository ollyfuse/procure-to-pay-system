import os
import logging
from celery import shared_task
from django.core.files.storage import default_storage
from .models import ProformaMetadata
from .utils import DocumentProcessor
from .ai_service import AIExtractionService

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_proforma_document(self, request_id: str, file_path: str):
    """
    Celery task to process uploaded proforma document
    1. Extract text from document
    2. Use AI to extract structured metadata
    3. Save results to ProformaMetadata model
    """
    try:
        from apps.requests.models import PurchaseRequest
        
        # Get the purchase request
        try:
            purchase_request = PurchaseRequest.objects.get(id=request_id)
        except PurchaseRequest.DoesNotExist:
            logger.error(f"PurchaseRequest {request_id} not found")
            return {'success': False, 'error': 'Purchase request not found'}
        
        # Get or create metadata record
        metadata, created = ProformaMetadata.objects.get_or_create(
            request=purchase_request,
            defaults={'extraction_status': ProformaMetadata.ExtractionStatus.PENDING}
        )
        
        # Step 1: Extract text from document
        logger.info(f"Extracting text from {file_path}")
        
        # Get full file path
        if default_storage.exists(file_path):
            full_path = default_storage.path(file_path)
        else:
            logger.error(f"File not found: {file_path}")
            metadata.extraction_status = ProformaMetadata.ExtractionStatus.FAILED
            metadata.error_message = "File not found"
            metadata.save()
            return {'success': False, 'error': 'File not found'}
        
        # Extract text
        extraction_result = DocumentProcessor.extract_text_from_document(full_path)
        
        if not extraction_result['success']:
            logger.error(f"Text extraction failed: {extraction_result['error']}")
            metadata.extraction_status = ProformaMetadata.ExtractionStatus.FAILED
            metadata.error_message = extraction_result['error']
            metadata.save()
            return {'success': False, 'error': extraction_result['error']}
        
        extracted_text = extraction_result['text']
        metadata.raw_text = extracted_text
        
        # Step 2: AI metadata extraction
        logger.info(f"Processing text with AI for request {request_id}")
        
        ai_service = AIExtractionService()
        ai_result = ai_service.extract_metadata(extracted_text)
        
        if ai_result['success']:
            # Save extracted data
            data = ai_result['data']
            metadata.vendor_name = data.get('vendor_name', '')
            metadata.vendor_address = data.get('vendor_address', '')
            metadata.total_amount = data.get('total_amount')
            metadata.currency = data.get('currency', '')
            metadata.payment_terms = data.get('payment_terms', '')
            metadata.items = data.get('items', [])
            metadata.confidence_score = ai_result.get('confidence', 0.0)
            metadata.ai_response = ai_result.get('raw_response', {})
            
            # Determine status based on confidence
            if metadata.confidence_score >= 0.7:
                metadata.extraction_status = ProformaMetadata.ExtractionStatus.SUCCESS
            elif metadata.confidence_score >= 0.3:
                metadata.extraction_status = ProformaMetadata.ExtractionStatus.PARTIAL
            else:
                metadata.extraction_status = ProformaMetadata.ExtractionStatus.FAILED
                metadata.error_message = "Low confidence in extracted data"
        else:
            # AI extraction failed
            metadata.extraction_status = ProformaMetadata.ExtractionStatus.FAILED
            metadata.error_message = ai_result.get('error', 'AI extraction failed')
            metadata.ai_response = {'error': ai_result.get('error', 'Unknown error')}
        
        metadata.save()
        
        logger.info(f"Proforma processing completed for request {request_id}")
        
        return {
            'success': True,
            'extraction_status': metadata.extraction_status,
            'confidence_score': metadata.confidence_score,
            'vendor_name': metadata.vendor_name,
            'total_amount': str(metadata.total_amount) if metadata.total_amount else None
        }
        
    except Exception as e:
        logger.error(f"Error processing proforma for request {request_id}: {str(e)}")
        
        # Update metadata with error
        try:
            metadata = ProformaMetadata.objects.get(request_id=request_id)
            metadata.extraction_status = ProformaMetadata.ExtractionStatus.FAILED
            metadata.error_message = str(e)
            metadata.save()
        except:
            pass
        
        # Retry the task
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying task in 60 seconds (attempt {self.request.retries + 1})")
            raise self.retry(countdown=60, exc=e)
        
        return {'success': False, 'error': str(e)}
    

@shared_task(bind=True, max_retries=3)
def process_receipt_validation(self, request_id: str):
    """Process receipt and validate against PO"""
    try:
        from apps.requests.models import PurchaseRequest
        from .models import ReceiptMetadata
        from .ai_service import ReceiptValidationService
        
        purchase_request = PurchaseRequest.objects.get(id=request_id)
        
        if not hasattr(purchase_request, 'purchase_order'):
            return {'success': False, 'error': 'No PO found'}
        
        # Extract text from receipt
        receipt_path = purchase_request.receipt_file.path
        extraction_result = DocumentProcessor.extract_text_from_document(receipt_path)
        
        if not extraction_result['success']:
            return {'success': False, 'error': extraction_result['error']}
        
        # Validate receipt
        validator = ReceiptValidationService()
        validation_result = validator.validate_receipt(
            extraction_result['text'], 
            purchase_request.purchase_order
        )
        
        # Save results
        receipt_metadata, created = ReceiptMetadata.objects.get_or_create(
            request=purchase_request,
            defaults={'validation_status': ReceiptMetadata.ValidationStatus.PENDING}
        )
        
        if validation_result['success']:
            data = validation_result['receipt_data']
            receipt_metadata.vendor_name = data.get('vendor_name', '')
            receipt_metadata.total_amount = data.get('total_amount')
            receipt_metadata.currency = data.get('currency', '')
            receipt_metadata.items = data.get('items', [])
            receipt_metadata.validation_status = validation_result['validation_status']
            receipt_metadata.discrepancies = validation_result['discrepancies']
            receipt_metadata.confidence_score = validation_result['confidence']
        else:
            receipt_metadata.validation_status = ReceiptMetadata.ValidationStatus.FAILED
        
        receipt_metadata.save()
        
        return {'success': True, 'validation_status': receipt_metadata.validation_status}
        
    except Exception as e:
        logger.error(f"Receipt validation failed: {str(e)}")
        return {'success': False, 'error': str(e)}
