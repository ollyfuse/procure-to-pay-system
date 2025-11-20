import React from 'react';

export const Finance: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Approved Requests</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">No approved requests</p>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Purchase Orders</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">No purchase orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};
