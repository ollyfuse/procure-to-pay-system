# Procure-to-Pay Frontend

Modern React TypeScript frontend for the procurement management system, featuring responsive design, role-based access control, and real-time document processing.

## 🚀 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Heroicons** - Beautiful SVG icons

## ✨ Features

### 🔐 Authentication & Authorization
- JWT token management with auto-refresh
- Role-based route protection
- Secure login with demo credentials
- Automatic token expiration handling

### 📱 Responsive Design
- Mobile-first approach
- Responsive navigation and layouts
- Touch-friendly interface
- Optimized for all screen sizes

### 👥 Role-Based Dashboards
- **Staff**: Create requests, upload documents, track status
- **Approvers**: Review pending requests, approval history
- **Finance**: Payment processing, receipt validation
- Real-time status updates

### 📄 Document Management
- Drag-and-drop file uploads
- Real-time processing status
- Document viewer with metadata
- Receipt-to-PO comparison interface

### 🎨 Modern UI/UX
- Clean, professional design
- Smooth animations and transitions
- Interactive components
- Consistent design system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

###Project Structure
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Navbar.tsx      # Top navigation
│   ├── Sidebar.tsx     # Side navigation
│   ├── Upload.tsx      # File upload component
│   └── ...
├── pages/              # Route-based page components
│   ├── Dashboard.tsx   # Role-based dashboard
│   ├── Login.tsx       # Authentication page
│   ├── Requests.tsx    # Request management
│   └── ...
├── services/           # API service layer
│   ├── api.ts         # Base API configuration
│   ├── auth.ts        # Authentication services
│   ├── requests.ts    # Request management
│   └── ...
├── context/           # React context providers
│   └── AuthContext.tsx # Authentication state
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared types
└── App.tsx            # Main application component

