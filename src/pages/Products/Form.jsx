import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { productsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ 1. State updated to match all database columns
  const [form, setForm] = useState({
    name: '',
    category: '',
    hsn_code: '',
    type: 'Goods',
    sales_price: 0,
    purchase_price: 0,
    cost_price: 0,
    tax_percent: 0,
  });

  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await productsAPI.getById(id);
        setForm(res.data?.[0] || {});
      } catch (e) {
        console.error('Load product error:', e);
      }
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
      show('Product name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      // ✅ 2. Payload updated to send all database fields to the API
      const payload = {
        name: form.name?.trim(),
        category: form.category?.trim() || null,
        hsn_code: form.hsn_code?.trim() || null,
        type: form.type?.trim() || 'Goods',
        sales_price: form.sales_price === '' || form.sales_price === null ? null : Number(form.sales_price),
        purchase_price: form.purchase_price === '' || form.purchase_price === null ? null : Number(form.purchase_price),
        // cost_price: form.cost_price === '' || form.cost_price === null ? null : Number(form.cost_price),
        tax_percent: form.tax_percent === '' || form.tax_percent === null ? null : Number(form.tax_percent),
      };

      if (id) await productsAPI.update(id, payload);
      else await productsAPI.create(payload);

      show('Product saved successfully', 'success');
      navigate('/products');
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.hint ||
        e?.message ||
        'Failed to save product';
      show(msg, 'error');
      console.error('Save product error:', e?.response || e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{id ? 'Edit' : 'Add'} Product</h2>
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* ✅ 3. Form inputs updated to match all database fields */}
          <Input label="Name" name="name" value={form.name || ''} onChange={handleChange} required />
          <Input label="Category" name="category" value={form.category || ''} onChange={handleChange} />
          <Input label="HSN Code" name="hsn_code" value={form.hsn_code || ''} onChange={handleChange} />
          <Input label="Type" name="type" value={form.type || ''} onChange={handleChange} />
          <Input label="Sales Price" name="sales_price" type="number" value={form.sales_price || 0} onChange={handleChange} />
          <Input label="Purchase Price" name="purchase_price" type="number" value={form.purchase_price || 0} onChange={handleChange} />
          {/* <Input label="Cost Price" name="cost_price" type="number" value={form.cost_price || 0} onChange={handleChange} /> */}
          <Input label="Tax Percent" name="tax_percent" type="number" value={form.tax_percent || 0} onChange={handleChange} />

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm;