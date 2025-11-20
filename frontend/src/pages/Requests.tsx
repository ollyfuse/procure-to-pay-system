import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

export const Requests: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <Link to="/requests/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Request
        </Link>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No requests found</p>
          <Link to="/requests/new" className="btn-primary">
            Create Your First Request
          </Link>
        </div>
      </div>
    </div>
  );
};
