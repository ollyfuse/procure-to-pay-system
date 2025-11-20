import React from 'react';

export const Approvals: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
      
      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500">No pending approvals</p>
        </div>
      </div>
    </div>
  );
};
