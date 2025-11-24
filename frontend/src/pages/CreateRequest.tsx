import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../services/requests';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface RequestItem {
  description: string;
  quantity: number;
  unit_price: string;
  total_price?: string;
}

export const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [items, setItems] = useState<RequestItem[]>([
    { description: '', quantity: 1, unit_price: '' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleItemChange = (index: number, field: keyof RequestItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, unit_price: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateItemTotal = (item: RequestItem) => {
    const price = parseFloat(item.unit_price) || 0;
    return (price * item.quantity).toFixed(2);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.unit_price) || 0;
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a request title');
      return;
    }

    const hasValidItems = items.some(item => 
      item.description.trim() && item.quantity > 0 && parseFloat(item.unit_price) > 0
    );

    if (!hasValidItems) {
      toast.error('Please add at least one valid item');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        ...formData,
        total_amount: calculateTotal(),
        items: items
          .filter(item => item.description.trim() && parseFloat(item.unit_price) > 0)
          .map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: calculateItemTotal(item)
          }))
      };
      const newRequest = await requestService.createRequest(requestData as any);
      toast.success('Purchase request created successfully!');
      navigate(`/requests/${newRequest.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/requests')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Purchase Request</h1>
                <p className="text-gray-600 mt-1">Submit a new purchase request for approval</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter a descriptive title for your request"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Provide additional details about your request (optional)"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Description */}
                    <div className="sm:col-span-2 lg:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Item description"
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">RWF</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    {/* Total */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 font-medium">
                        RWF{calculateItemTotal(item)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="lg:col-span-1 flex items-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Request Total:</span>
                <span className="text-2xl font-bold text-green-600">RWF{calculateTotal()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
