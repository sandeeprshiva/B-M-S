import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { vendorsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const VendorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // ✅ 1. State updated to match the database schema
  const [form, setForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await vendorsAPI.getById(id);
        setForm(res.data?.[0] || {});
      } catch (e) {}
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      show('Vendor name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      // No changes needed here, the entire updated 'form' object is sent
      if (id) await vendorsAPI.update(id, form);
      else await vendorsAPI.create(form);
      show('Vendor saved successfully', 'success');
      navigate('/vendors');
    } catch (e) {
      show('Failed to save vendor', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{id ? 'Edit' : 'Add'} Vendor</h2>
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* ✅ 2. Form inputs updated to match the state and schema */}
          <Input label="Name" name="name" value={form.name || ''} onChange={handleChange} required />
          <Input label="Contact Person" name="contact_person" value={form.contact_person || ''} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={form.email || ''} onChange={handleChange} />
          <Input label="Phone" name="phone" value={form.phone || ''} onChange={handleChange} />
          <Input label="Address" name="address" value={form.address || ''} onChange={handleChange} />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default VendorForm;