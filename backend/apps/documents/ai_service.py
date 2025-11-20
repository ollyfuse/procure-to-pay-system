import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from pydantic import BaseModel, ValidationError
from decimal import Decimal

try:
    import openai
except ImportError:
    openai = None

logger = logging.getLogger(__name__)

class ProformaData(BaseModel):
    """Pydantic model for validating extracted proforma data"""
    vendor_name: str = ""
    vendor_address: str = ""
    total_amount: Optional[float] = None
    currency: str = ""
    payment_terms: str = ""
    items: list = []

class AIExtractionService:
    """Service for AI-powered metadata extraction from proforma documents"""
    
    def __init__(self):
        self.client = None
        if openai and hasattr(settings, 'OPENAI_API_KEY'):
            openai.api_key = settings.OPENAI_API_KEY
            self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def extract_metadata(self, text: str) -> Dict[str, Any]:
        """Extract structured metadata from proforma text using AI"""
        if not self.client:
            return {
                'success': False,
                'error': 'OpenAI client not configured',
                'data': {}
            }
        
        try:
            prompt = self._build_extraction_prompt(text)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert at extracting structured data from business documents."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content
            extracted_data = self._parse_ai_response(ai_response)
            
            # Validate with Pydantic
            validated_data = ProformaData(**extracted_data)
            
            return {
                'success': True,
                'data': validated_data.dict(),
                'raw_response': ai_response,
                'confidence': self._calculate_confidence(validated_data)
            }
            
        except Exception as e:
            logger.error(f"AI extraction failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'data': {}
            }
    
    def _build_extraction_prompt(self, text: str) -> str:
        """Build the prompt for AI extraction"""
        return f"""
Extract the following information from this proforma/invoice document and return it as valid JSON:

Document text:
{text}

Please extract:
1. vendor_name: The company/vendor name
2. vendor_address: Full vendor address
3. total_amount: Total amount as a number (no currency symbols)
4. currency: Currency code (USD, EUR, etc.)
5. payment_terms: Payment terms or conditions
6. items: Array of items with description, quantity, unit_price, total_price

Return ONLY valid JSON in this exact format:
{{
    "vendor_name": "Company Name",
    "vendor_address": "Full address",
    "total_amount": 1234.56,
    "currency": "USD",
    "payment_terms": "Net 30",
    "items": [
        {{
            "description": "Item name",
            "quantity": 1,
            "unit_price": 100.00,
            "total_price": 100.00
        }}
    ]
}}

If any field cannot be found, use empty string for text fields, null for numbers, and empty array for items.
"""
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response and extract JSON"""
        try:
            # Try to find JSON in the response
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start != -1 and end != -1:
                json_str = response[start:end]
                return json.loads(json_str)
            else:
                # If no JSON found, try parsing the whole response
                return json.loads(response)
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Response was: {response}")
            return {}
    
    def _calculate_confidence(self, data: ProformaData) -> float:
        """Calculate confidence score based on extracted data completeness"""
        score = 0.0
        total_fields = 6
        
        if data.vendor_name:
            score += 1
        if data.vendor_address:
            score += 1
        if data.total_amount is not None:
            score += 1
        if data.currency:
            score += 1
        if data.payment_terms:
            score += 1
        if data.items:
            score += 1
            
        return score / total_fields
