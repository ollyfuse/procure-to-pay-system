# Procure-to-Pay System

A comprehensive full-stack procurement management system built with Django REST Framework backend and React TypeScript frontend, featuring role-based access control, multi-level approvals, and AI-powered document processing.

## 🚀 Current Features

### Backend (Django + DRF)
- ✅ **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Custom user model with role-based permissions
  - Four distinct user roles: Staff, Approver L1, Approver L2, Finance
- ✅ **Purchase Request Management**
  - Full CRUD operations with role-based access
  - Multi-level approval workflow (L1 → L2 → Finance)
  - Request status tracking and history
  - Optimistic locking to prevent race conditions
- ✅ **Document Processing**
  - Secure file upload with validation
  - OCR text extraction (pdfplumber + pytesseract)
  - AI-powered metadata extraction using Google Gemini
  - Async processing with Celery tasks
- ✅ **Purchase Order Generation**
  - Automatic PO creation upon full approval
  - Structured PO numbering system (PO-YYYY-NNNNNN)
  - Vendor information integration
- ✅ **Payment & Receipt Management**
  - Payment status tracking
  - Receipt upload and validation
  - Receipt-to-PO comparison and discrepancy detection
- ✅ **Notifications System**
  - Email notifications for approvals, rejections, clarifications
  - Receipt reminders and finance notifications
- ✅ **Infrastructure**
  - Docker containerization with PostgreSQL and Redis
  - Comprehensive test suite
  - Environment-based configuration

### Frontend (React + TypeScript)
- ✅ **Modern Tech Stack**
  - React 19 with TypeScript
  - Tailwind CSS for responsive design
  - Vite for fast development and building
- ✅ **Authentication & Navigation**
  - JWT token management with auto-refresh
  - Protected routes with role-based access
  - Responsive sidebar navigation
- ✅ **Role-Based Dashboards**
  - Staff: Request creation, tracking, receipt submission
  - Approvers: Approval queue, history, clarification requests
  - Finance: Payment processing, receipt validation
- ✅ **Document Management**
  - Drag-and-drop file uploads
  - Real-time processing status
  - Document viewer with metadata display
- ✅ **Advanced Features**
  - Receipt-to-PO comparison interface
  - Payment status management
  - Clarification workflow
  - Approval history tracking

## 👥 Demo Credentials

The system includes pre-configured demo accounts for testing:

| Role | Username | Password | Capabilities |
|------|----------|----------|-------------|
| **Staff** | `staff_user` | `testpass123` | Create requests, upload documents, submit receipts |
| **Approver L1** | `approver_l1` | `testpass123` | First-level approvals, request clarifications |
| **Approver L2** | `approver_l2` | `testpass123` | Final approvals, trigger PO generation |
| **Finance** | `finance_user` | `testpass123` | Payment processing, receipt validation |

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login/` - User authentication
- `POST /api/auth/refresh/` - Token refresh
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - User profile

### Purchase Requests
- `GET /api/requests/` - List requests (role-filtered)
- `POST /api/requests/` - Create request (staff only)
- `GET /api/requests/{id}/` - Request details
- `PATCH /api/requests/{id}/` - Update request (owner, pending only)
- `DELETE /api/requests/{id}/` - Delete request (owner, pending only)
- `PATCH /api/requests/{id}/approve/` - Approve request
- `PATCH /api/requests/{id}/reject/` - Reject request
- `POST /api/requests/{id}/request-clarification/` - Request more info
- `POST /api/requests/{id}/respond-to-clarification/` - Respond to clarification
- `POST /api/requests/{id}/upload-proforma/` - Upload proforma document
- `POST /api/requests/{id}/upload-receipt/` - Upload receipt
- `PATCH /api/requests/{id}/update-payment-status/` - Update payment status
- `GET /api/requests/my-approvals/` - Approver's decision history

### Purchase Orders
- `GET /api/purchase-orders/` - List purchase orders
- `GET /api/purchase-orders/{id}/` - PO details
###
- `http://13.53.39.8/api/docs/` - swagger api

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for local backend development)
- **Git**

### Option 1: Docker Setup (Recommended)

1. **Clone and setup:**
```bash
git clone <repo-url>
cd procure-to-pay

cd backend
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d


docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py seed_users

cd ../frontend
npm install
npm run dev

backend/
├── apps/
│   ├── users/          # User management & authentication
│   ├── requests/       # Purchase request CRUD & workflow
│   ├── approvals/      # Approval workflow & history
│   ├── documents/      # File processing & AI extraction
│   ├── po/            # Purchase order generation
│   └── notifications/ # Email notifications
├── backend/
│   └── settings/      # Environment-based settings
└── tests/             # Comprehensive test suite



frontend/src/
├── components/        # Reusable UI components
├── pages/            # Route-based page components
├── services/         # API service layer
├── context/          # React context (Auth)
└── types/           # TypeScript type definitions


# Database
DB_NAME=procure_to_pay
DB_USER=postgres
DB_PASSWORD=postgres

# AI Processing
GOOGLE_API_KEY=your-gemini-api-key

# Email Notifications
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000

Backend Tests

cd backend
python manage.py test
