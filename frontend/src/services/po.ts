import api from './api';

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_name: string;
  total_amount: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: string;
    total_price: string;
  }>;
  created_at: string;
  po_document?: string;
}

export const poService = {
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await api.get('/po/');
    return response.data.results || response.data;
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.get(`/po/${id}/`);
    return response.data;
  }
};
