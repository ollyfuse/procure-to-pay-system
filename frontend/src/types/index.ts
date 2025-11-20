// Base types first
export type UserRole = 'staff' | 'approver_level_1' | 'approver_level_2' | 'finance';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  approver_level?: number;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Request types
export interface RequestItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Approval {
  id: string;
  level: number;
  action: 'approved' | 'rejected';
  comment: string;
  created_at: string;
  approver_details: User;
}

export interface ProformaMetadata {
  id: string;
  vendor_name: string;
  vendor_address: string;
  total_amount?: number;
  currency: string;
  extraction_status: 'pending' | 'success' | 'partial' | 'failed';
  confidence_score?: number;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  description: string;
  total_amount: string;
  status: RequestStatus;
  current_approval_level: number;
  created_by: string;
  created_by_username: string;
  proforma_file?: string;
  created_at: string;
  updated_at: string;
  items: RequestItem[];
  approvals: Approval[];
  proforma_metadata?: ProformaMetadata;
  is_locked: boolean;
}
