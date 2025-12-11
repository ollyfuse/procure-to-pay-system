# Procure-to-Pay System

A comprehensive enterprise procurement management system built with Django REST Framework and React TypeScript, featuring AI-powered document processing, multi-level approvals, and role-based access control.

## 🌟 Live Demo

- **Application**: [https://procuretopays.netlify.app](https://procuretopays.netlify.app)
- **API Documentation**: [http://16.171.30.43/api/docs/](http://16.171.30.43/api/docs)
- **GitHub repo**: [https://github.com/ollyfuse/procure-to-pay-system.git](https://github.com/ollyfuse/procure-to-pay-system.git)

## 🏗️ Architecture

### Backend Stack
- **Framework**: Django REST Framework
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + Celery
- **AI Processing**: Google Gemini API
- **Authentication**: JWT with refresh tokens
- **Deployment**: Docker + AWS EC2

### Frontend Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Netlify
- **State Management**: React Context

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with auto-refresh
- Role-based access control (Staff, Approver L1/L2, Finance)
- Protected routes and API endpoints

### 📋 Purchase Request Management
- Complete CRUD operations with role-based filtering
- Multi-level approval workflow (L1 → L2 → Finance)
- Request status tracking and approval history
- Optimistic locking to prevent race conditions

### 🤖 AI-Powered Document Processing
- OCR text extraction from PDFs and images
- Automated metadata extraction using Google Gemini
- Vendor information and line item detection
- Asynchronous processing with Celery

### 📄 Purchase Order Generation
- Automatic PO creation upon full approval
- Structured numbering system (PO-YYYY-NNNNNN)
- Vendor information integration

### 💰 Payment & Receipt Management
- Payment status tracking and updates
- Receipt upload and validation
- AI-powered receipt-to-PO comparison
- Discrepancy detection and reporting

### 📧 Notification System
- Email notifications for all workflow events
- Approval/rejection notifications
- Receipt reminders and finance alerts
- Clarification request workflows

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd procure-to-pay

2. Backend Setup
cd backend
cp .env.example .env
# Configure your environment variables (see Configuration section)

# Start services
docker-compose up -d

# Run migrations and seed data
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py seed_users

bash
3. Frontend Setup
cd frontend
npm install
npm run build

# Deploy to Netlify or run locally
npm run dev

bash
⚙️ Configuration
Backend Environment Variables
# Database
DB_NAME=procure_to_pay
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=db
DB_PORT=5432

# AI Processing
GOOGLE_API_KEY=your-gemini-api-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost

# CORS
CORS_ALLOW_ALL_ORIGINS=True

bash
Frontend Environment Variables
VITE_API_URL=/.netlify/functions/api

bash
👥 User Roles & Permissions
Role	Capabilities
Staff	Create requests, upload documents, submit receipts
Approver L1	First-level approvals, request clarifications
Approver L2	Final approvals, trigger PO generation
Finance	Payment processing, receipt validation
🔗 API Reference
Authentication Endpoints
POST /api/auth/login/          # User login
POST /api/auth/refresh/        # Token refresh
GET  /api/auth/profile/        # User profile

Purchase Request Endpoints
GET    /api/requests/                              # List requests
POST   /api/requests/                              # Create request
GET    /api/requests/{id}/                         # Request details
PATCH  /api/requests/{id}/approve/                 # Approve request
PATCH  /api/requests/{id}/reject/                  # Reject request
POST   /api/requests/{id}/upload-proforma/         # Upload proforma
POST   /api/requests/{id}/upload-receipt/          # Upload receipt
PATCH  /api/requests/{id}/update-payment-status/   # Update payment

Purchase Order Endpoints
GET /api/purchase-orders/      # List purchase orders
GET /api/purchase-orders/{id}/ # PO details

🏗️ Project Structure
procure-to-pay/
├── backend/
│   ├── apps/
│   │   ├── users/          # Authentication & user management
│   │   ├── requests/       # Purchase request CRUD & workflow
│   │   ├── approvals/      # Multi-level approval system
│   │   ├── documents/      # AI document processing
│   │   ├── po/            # Purchase order generation
│   │   └── notifications/ # Email notification system
│   ├── backend/settings/   # Environment-based configuration
│   └── tests/             # Comprehensive test suite
└── frontend/src/
    ├── components/        # Reusable UI components
    ├── pages/            # Route-based page components
    ├── services/         # API service layer
    ├── context/          # React context providers
    └── types/           # TypeScript type definitions

🧪 Testing
Backend Tests
cd backend
python manage.py test

bash
Frontend Tests
cd frontend
npm run test

bash
🚀 Deployment
Backend (AWS EC2)
Configure environment variables

Run docker-compose up -d

Execute migrations and seed data

Frontend (Netlify)
Build: npm run build

Deploy dist folder to Netlify

Configure Netlify Functions for API proxy

🔒 Security Features
JWT authentication with refresh tokens

Role-based access control

CORS protection

File upload validation

SQL injection prevention

XSS protection headers

📈 Performance Features
Optimistic locking for concurrent operations

Async document processing with Celery

Database query optimization

CDN delivery via Netlify

Redis caching for sessions

🤝 Contributing
Fork the repository

Create a feature branch

Make your changes

Add tests for new functionality

Submit a pull request

📄 License
This project is licensed under the MIT License.

🆘 Support
For support and questions:

Create an issue in the repository

Check the API documentation

Review the test cases for usage examples

Built with ❤️ using Django REST Framework and React TypeScript

