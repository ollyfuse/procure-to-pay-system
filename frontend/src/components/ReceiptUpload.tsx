import React, { useState } from 'react';
import { requestService } from '../services/requests';
import toast from 'react-hot-toast';

interface ReceiptUploadProps {
  requestId: string;
  onUploadComplete: () => void;
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ requestId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await requestService.uploadReceipt(requestId, file);
      toast.success('Receipt uploaded successfully!');
      onUploadComplete();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="receipt-upload"
      />
      <label
        htmlFor="receipt-upload"
        className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
      >
        <div className="text-gray-600 mb-2">
          📄 {uploading ? 'Uploading...' : 'Upload Receipt'}
        </div>
        <div className="text-sm text-gray-500">
          Click to select receipt file (PDF, JPG, PNG)
        </div>
      </label>
    </div>
  );
};
