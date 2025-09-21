import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { usersAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const CreateUser = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    status: 'active'
  });

  const roleOptions = [
    { value: '', label: 'Select Role' },
    { value: 'admin', label: 'Admin - Full Access' },
    { value: 'sales', label: 'Sales - Sales & Inventory' },
    { value: 'accounts', label: 'Accounts - Financial Management' },
    { value: 'purchase', label: 'Purchase - Procurement & Orders' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.username || !form.email || !form.password || !form.confirmPassword || !form.role) {
      show('Please fill in all required fields', 'error');
      return;
    }

    if (form.password !== form.confirmPassword) {
      show('Passwords do not match', 'error');
      return;
    }

    if (form.password.length < 6) {
      show('Password must be at least 6 characters', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      show('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      // Check if username already exists
      const existingUserResponse = await usersAPI.getByUsername(form.username);
      if (existingUserResponse.data && existingUserResponse.data.length > 0) {
        show('Username already exists', 'error');
        setLoading(false);
        return;
      }

      // Check if email already exists
      const existingEmailResponse = await usersAPI.getByEmail(form.email);
      if (existingEmailResponse.data && existingEmailResponse.data.length > 0) {
        show('Email already exists', 'error');
        setLoading(false);
        return;
      }

      const userData = {
        name: form.name.trim(),
        username: form.username.toLowerCase().trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password, // In production, this should be hashed
        role: form.role,
        status: form.status,
        created_at: new Date().toISOString()
      };

      await usersAPI.create(userData);
      show('User created successfully', 'success');
      navigate('/users');
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.hint || 
                          'Failed to create user';
      show(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create User</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
        >
          Back to Users
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter full name"
              required
            />

            <Input
              label="Username"
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email address"
              required
            />

            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={roleOptions}
              required
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password (min 6 characters)"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm password"
              required
            />

            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={statusOptions}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 md:flex-none"
            >
              {loading ? 'Creating User...' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/users')}
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <Card title="User Role Permissions" className="bg-blue-50 dark:bg-blue-900/20">
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-blue-600 dark:text-blue-400">Admin:</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">Full system access including user management</span>
          </div>
          <div>
            <span className="font-medium text-green-600 dark:text-green-400">Sales:</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">Sales management, inventory, and analytics</span>
          </div>
          <div>
            <span className="font-medium text-purple-600 dark:text-purple-400">Accounts:</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">Financial management, ledger, and reports</span>
          </div>
          <div>
            <span className="font-medium text-orange-600 dark:text-orange-400">Purchase:</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">Purchase orders, vendor management, and inventory</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateUser;
