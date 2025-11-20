import os
import logging
import magic
from typing import Optional, Dict, Any
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile

# Document processing imports
try:
    import pdfplumber
    import PyPDF2
    import pytesseract
    from PIL import Image
except ImportError as e:
    logging.warning(f"Document processing library not available: {e}")

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Handles text extraction from various document types"""
    
    ALLOWED_TYPES = {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/tiff': ['.tiff', '.tif']
    }
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @classmethod
    def validate_file(cls, file: UploadedFile) -> Dict[str, Any]:
        """Validate uploaded file"""
        errors = []
        
        # Check file size
        if file.size > cls.MAX_FILE_SIZE:
            errors.append(f"File size {file.size} exceeds maximum {cls.MAX_FILE_SIZE}")
        
        # Check file type
        try:
            file_type = magic.from_buffer(file.read(1024), mime=True)
            file.seek(0)  # Reset file pointer
            
            if file_type not in cls.ALLOWED_TYPES:
                errors.append(f"File type {file_type} not allowed")
                
        except Exception as e:
            errors.append(f"Could not determine file type: {str(e)}")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'file_type': file_type if 'file_type' in locals() else None
        }
    
    @classmethod
    def extract_text_from_document(cls, file_path: str) -> Dict[str, Any]:
        """Extract text from document file"""
        try:
            # Determine file type
            file_type = magic.from_file(file_path, mime=True)
            
            if file_type == 'application/pdf':
                return cls._extract_from_pdf(file_path)
            elif file_type.startswith('image/'):
                return cls._extract_from_image(file_path)
            else:
                return {
                    'success': False,
                    'text': '',
                    'error': f'Unsupported file type: {file_type}'
                }
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            return {
                'success': False,
                'text': '',
                'error': str(e)
            }
    
    @classmethod
    def _extract_from_pdf(cls, file_path: str) -> Dict[str, Any]:
        """Extract text from PDF using pdfplumber with PyPDF2 fallback"""
        text = ""
        
        try:
            # Try pdfplumber first (better for tables and layout)
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            if text.strip():
                return {'success': True, 'text': text.strip(), 'method': 'pdfplumber'}
                
        except Exception as e:
            logger.warning(f"pdfplumber failed for {file_path}: {str(e)}")
        
        try:
            # Fallback to PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            
            if text.strip():
                return {'success': True, 'text': text.strip(), 'method': 'PyPDF2'}
                
        except Exception as e:
            logger.error(f"PyPDF2 also failed for {file_path}: {str(e)}")
            return {
                'success': False,
                'text': '',
                'error': f'PDF extraction failed: {str(e)}'
            }
        
        return {
            'success': False,
            'text': '',
            'error': 'No text could be extracted from PDF'
        }
    
    @classmethod
    def _extract_from_image(cls, file_path: str) -> Dict[str, Any]:
        """Extract text from image using OCR"""
        try:
            # Use pytesseract for OCR
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            
            return {
                'success': True,
                'text': text.strip(),
                'method': 'pytesseract'
            }
            
        except Exception as e:
            logger.error(f"OCR failed for {file_path}: {str(e)}")
            return {
                'success': False,
                'text': '',
                'error': f'OCR extraction failed: {str(e)}'
            }
