export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface RequestItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Approval {
  id: string;
  level: number;
  approved_by?: string;
  approved_by_username?: string;
  approved_at?: string;
  status: 'pending' | 'approved' | 'rejected';
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
  proforma_file_url?: string;
  created_at: string;
  updated_at: string;
  items: RequestItem[];
  approvals: Approval[];
  proforma_metadata?: ProformaMetadata;
  is_locked: boolean;
}

export interface ProformaMetadata {
  id: string;
  vendor_name: string;
  vendor_address: string;
  total_amount?: number;
  currency: string;
  extraction_status: 'pending' | 'success' | 'partial' | 'failed';
  confidence_score?: number;
  error_message?: string;
}
