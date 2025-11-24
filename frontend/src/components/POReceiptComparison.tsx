import React from 'react';
import type { PurchaseOrder, ReceiptMetadata } from '../types';

interface POReceiptComparisonProps {
  purchaseOrder: PurchaseOrder;
  receiptMetadata: ReceiptMetadata;
}

export const POReceiptComparison: React.FC<POReceiptComparisonProps> = ({
  purchaseOrder,
  receiptMetadata
}) => {
  const hasDiscrepancies = receiptMetadata.discrepancies.length > 0;

  // Helper function to match items between PO and Receipt
  const getItemComparison = () => {
    const poItems = purchaseOrder.items;
    const receiptItems = receiptMetadata.items;
    
    // Create comparison array
    const maxItems = Math.max(poItems.length, receiptItems.length);
    const comparisons = [];
    
    for (let i = 0; i < maxItems; i++) {
      const poItem = poItems[i];
      const receiptItem = receiptItems[i];
      
      comparisons.push({
        poItem,
        receiptItem,
        hasIssue: poItem && receiptItem && (
          poItem.description !== receiptItem.description ||
          Math.abs(parseFloat(poItem.unit_price) - parseFloat(receiptItem.unit_price || '0')) > 0.01 ||
          poItem.quantity !== receiptItem.quantity
        )
      });
    }
    
    return comparisons;
  };

  const itemComparisons = getItemComparison();

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">PO vs Receipt Detailed Comparison</h3>
      
      {/* High-Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Purchase Order Summary */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Purchase Order ({purchaseOrder.po_number})</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Vendor:</span> 
              <span>{purchaseOrder.vendor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total:</span> 
              <span className="font-mono">${purchaseOrder.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Items:</span> 
              <span>{purchaseOrder.items.length}</span>
            </div>
          </div>
        </div>

        {/* Receipt Summary */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Receipt</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Vendor:</span> 
              <span className={receiptMetadata.vendor_name !== purchaseOrder.vendor_name ? 'text-red-600' : ''}>
                {receiptMetadata.vendor_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total:</span> 
              <span className={`font-mono ${
                Math.abs(parseFloat(receiptMetadata.total_amount?.toString() || '0') - parseFloat(purchaseOrder.total_amount)) > 0.01 
                  ? 'text-red-600' : ''
              }`}>
                ${receiptMetadata.total_amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Items:</span> 
              <span className={receiptMetadata.items.length !== purchaseOrder.items.length ? 'text-red-600' : ''}>
                {receiptMetadata.items.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Item Comparison */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Item-by-Item Comparison</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PO Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receipt Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PO Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receipt Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itemComparisons.map((comparison, index) => (
                <tr key={index} className={`hover:bg-gray-50 ${comparison.hasIssue ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {comparison.poItem?.description || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {comparison.receiptItem?.description || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {comparison.poItem?.quantity || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {comparison.receiptItem?.quantity || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-mono">
                    {comparison.poItem?.unit_price ? `$${comparison.poItem.unit_price}` : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-mono">
                    {comparison.receiptItem?.unit_price ? `$${comparison.receiptItem.unit_price}` : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!comparison.poItem && comparison.receiptItem ? (
                      <span className="text-red-600 text-xs">Extra</span>
                    ) : comparison.poItem && !comparison.receiptItem ? (
                      <span className="text-red-600 text-xs">Missing</span>
                    ) : comparison.hasIssue ? (
                      <span className="text-red-600 text-xs">⚠️</span>
                    ) : (
                      <span className="text-green-600 text-xs">✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discrepancies */}
      {hasDiscrepancies && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h5 className="font-medium text-red-800 mb-2">⚠️ Discrepancies Found</h5>
          <ul className="space-y-1 text-sm text-red-700">
            {receiptMetadata.discrepancies.map((issue, index) => (
              <li key={index}>
                • <strong>{issue.type.replace('_', ' ')}:</strong> Expected "{issue.expected}", Got "{issue.actual}"
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Status */}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          receiptMetadata.validation_status === 'valid' 
            ? 'bg-green-100 text-green-800'
            : receiptMetadata.validation_status === 'discrepancy'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {receiptMetadata.validation_status}
        </span>
        <span className="text-sm text-gray-500">
          Confidence: {Math.round((receiptMetadata.confidence_score || 0) * 100)}%
        </span>
      </div>
    </div>
  );
};
