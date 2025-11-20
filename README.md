# Procure-to-Pay System

A containerized Django + DRF backend system for purchase request management with role-based access control.

## Sprint 1 Features

- ✅ JWT Authentication with custom user roles
- ✅ Purchase Request CRUD operations
- ✅ Role-based permissions (Staff can create/manage own requests)
- ✅ Docker containerization with PostgreSQL and Redis
- ✅ RESTful API with DRF

# Procure-to-Pay System

A containerized Django + DRF backend system for purchase request management with role-based access control and AI-powered document processing.

## Sprint 3 Features 

- ✅ **Document Upload System**: Secure proforma file uploads (PDF/JPG/PNG)
- ✅ **OCR Text Extraction**: Extract text from PDFs and images using pdfplumber + pytesseract
- ✅ **AI Metadata Extraction**: OpenAI GPT-powered structured data extraction
- ✅ **Async Processing**: Celery tasks for background document processing
- ✅ **Proforma Metadata**: Store extracted vendor, items, and financial data
- ✅ **File Validation**: Size limits, type checking, and error handling

## API Endpoints (Updated)

### Purchase Requests
- `GET /api/requests/` - List requests (filtered by user role)
- `POST /api/requests/` - Create new request (staff only)
- `GET /api/requests/{id}/` - Get request details (includes proforma metadata)
- `PUT/PATCH /api/requests/{id}/` - Update request (owner only, pending only)
- `DELETE /api/requests/{id}/` - Delete request (owner only, pending only)
- `PATCH /api/requests/{id}/approve/` - Approve request (approvers only)
- `PATCH /api/requests/{id}/reject/` - Reject request (approvers only)
- **`POST /api/requests/{id}/upload-proforma/`** - Upload proforma document ✨

## Document Processing Pipeline

1. **Upload**: Staff uploads proforma (PDF/JPG/PNG) to purchase request
2. **Validation**: File type, size, and format validation
3. **Text Extraction**: 
   - PDFs: pdfplumber → PyPDF2 fallback
   - Images: pytesseract OCR
4. **AI Processing**: OpenAI GPT extracts structured data:
   - Vendor name and address
   - Total amount and currency
   - Payment terms
   - Line items with quantities/prices
5. **Storage**: Metadata saved with confidence scores

## Environment Setup

**Required Environment Variables:**
```env
# OpenAI API (required for document processing)
OPENAI_API_KEY=your-openai-api-key-here

# Document Processing
TESSERACT_CMD=/usr/bin/tesseract


## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Setup

1. **Clone the repository:**
```bash
git clone <repo-url>
cd procure-to-pay
