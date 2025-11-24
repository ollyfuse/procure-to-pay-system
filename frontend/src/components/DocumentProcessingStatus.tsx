import React from 'react';
import type { ProformaMetadata } from '../types';

interface DocumentProcessingStatusProps {
  metadata: ProformaMetadata;
}

export const DocumentProcessingStatus: React.FC<DocumentProcessingStatusProps> = ({ metadata }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const confidencePercentage = Math.round((metadata.confidence_score || 0) * 100);

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">AI Processing Status</h3>
      
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Extraction Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metadata.extraction_status)}`}>
            {metadata.extraction_status}
          </span>
        </div>

        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
            <span className="text-sm text-gray-900">{confidencePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                confidencePercentage >= 70 ? 'bg-green-500' :
                confidencePercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
        </div>

        {/* Extracted Data Quality */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Vendor:</span>
            <span className={metadata.vendor_name ? 'text-green-600' : 'text-red-600'}>
              {metadata.vendor_name ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className={metadata.total_amount ? 'text-green-600' : 'text-red-600'}>
              {metadata.total_amount ? '✓' : '✗'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {metadata.error_message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{metadata.error_message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
