import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', name: '', role: 'sales', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await usersAPI.getById(id);
        const record = res.data?.[0] || {};
        setForm({ username: record.username || '', name: record.name || '', role: record.role || 'sales', password: record.password || '' });
      } catch (e) {}
    };
    load();
  }, [id]);

  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) await usersAPI.update(id, form);
      else await usersAPI.create(form);
      navigate('/users');
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{id ? 'Edit' : 'Add'} User</h2>
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Username" name="username" value={form.username} onChange={handleChange} required />
          <Input label="Name" name="name" value={form.name} onChange={handleChange} />
          <Select
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'sales', label: 'Sales' },
              { value: 'accounts', label: 'Accounts' },
              { value: 'purchase', label: 'Purchase' },
            ]}
          />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required={!id} />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default UserForm;
