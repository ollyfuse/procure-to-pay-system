import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import type { User } from '../types';

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put<User>('/auth/profile/', formData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || ''
    });
    setEditing(false);
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'staff': 'Staff Member',
      'approver_level_1': 'Level 1 Approver',
      'approver_level_2': 'Level 2 Approver',
      'finance': 'Finance Team'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'staff': 'bg-blue-50 text-blue-700 border-blue-200',
      'approver_level_1': 'bg-orange-50 text-orange-700 border-orange-200',
      'approver_level_2': 'bg-red-50 text-red-700 border-red-200',
      'finance': 'bg-green-50 text-green-700 border-green-200'
    };
    return colorMap[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="btn-secondary"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-success"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="mb-6">
              <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <UserCircleIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-gray-600">@{user?.username}</p>
            </div>

            <div className="space-y-3">
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${
                user?.role ? getRoleColor(user.role) : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                {user?.role ? getRoleDisplay(user.role) : 'User'}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <KeyIcon className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="label">First Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user?.first_name || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="label">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user?.last_name || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="label">Email Address</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user?.email || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="label">Username</label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
                  {user?.username} (Cannot be changed)
                </div>
              </div>

              <div className="form-group">
                <label className="label">Role</label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
                  {user?.role ? getRoleDisplay(user.role) : 'User'} (System assigned)
                </div>
              </div>

              {user?.approver_level && (
                <div className="form-group">
                  <label className="label">Approver Level</label>
                  <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
                    Level {user.approver_level} (System assigned)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <LockClosedIcon className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={passwordLoading}
                className="btn-primary"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
