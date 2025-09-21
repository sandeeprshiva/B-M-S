import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { purchaseOrdersAPI, vendorBillsAPI, vendorsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

const VendorBillCreate = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    purchase_order_id: '', 
    vendor_id: '',
    bill_number: '',
    bill_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    status: 'Unpaid', 
    amount: 0,
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        console.log('Loading data for vendor bill creation...');
        const [ordersRes, vendorsRes] = await Promise.all([
          purchaseOrdersAPI.getAll(),
          vendorsAPI.getAll()
        ]);
        
        console.log('Orders:', ordersRes.data);
        console.log('Vendors:', vendorsRes.data);
        
        setOrders(ordersRes.data || []);
        setVendors(vendorsRes.data || []);
        
        if (!ordersRes.data?.length) {
          show('No purchase orders available. Create a PO first.', 'warning');
        }
      } catch (e) {
        console.error('Error loading data:', e);
        show('Failed to load data. Please refresh and try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  // Auto-fill vendor when PO is selected
  const handlePOChange = (e) => {
    const poId = e.target.value;
    const selectedPO = orders.find(o => o.id === Number(poId));
    
    setForm(f => ({
      ...f,
      purchase_order_id: poId,
      vendor_id: selectedPO?.vendor_id || '',
      amount: selectedPO?.total_amount || 0
    }));
  };

  const submit = async () => {
    console.log('Submitting vendor bill:', form);
    
    // Validation
    if (!form.vendor_id) {
      show('Please select a vendor', 'error');
      return;
    }
    
    if (!form.bill_number) {
      show('Please enter a bill number', 'error');
      return;
    }
    
    if (!form.amount || form.amount <= 0) {
      show('Please enter a valid amount', 'error');
      return;
    }

    setSaving(true);
    try {
      const billData = {
        ...form,
        vendor_id: Number(form.vendor_id),
        purchase_order_id: form.purchase_order_id ? Number(form.purchase_order_id) : null,
        amount: Number(form.amount),
        created_at: new Date().toISOString()
      };
      
      console.log('Creating bill with data:', billData);
      
      const result = await vendorBillsAPI.create(billData);
      console.log('Bill created:', result);
      
      show('Vendor bill created successfully!', 'success');
      
      setTimeout(() => {
        navigate('/bills');
      }, 1000);
    } catch (e) {
      console.error('Error creating bill:', e);
      const errorMsg = e?.response?.data?.message || 
                      e?.response?.data?.hint || 
                      e?.message || 
                      'Failed to create vendor bill';
      show(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">New Vendor Bill</h2>
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Vendor Bill</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new bill from vendor</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/bills')}
        >
          Back to Bills
        </Button>
      </div>

      <Card title="Bill Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Purchase Order (Optional)"
            value={form.purchase_order_id}
            onChange={handlePOChange}
            options={[
              { value: '', label: 'Select Purchase Order (Optional)' }, 
              ...orders.map(o => ({ value: o.id, label: `PO #${o.id} - ${o.status}` }))
            ]}
          />
          
          <Select
            label="Vendor *"
            value={form.vendor_id}
            onChange={(e) => setForm(f => ({ ...f, vendor_id: e.target.value }))}
            options={[
              { value: '', label: 'Select Vendor' }, 
              ...vendors.map(v => ({ value: v.id, label: v.name }))
            ]}
            required
          />

          <Input 
            label="Bill Number *" 
            type="text" 
            value={form.bill_number} 
            onChange={(e) => setForm(f => ({ ...f, bill_number: e.target.value }))}
            placeholder="Enter bill number"
            required
          />

          <Input 
            label="Bill Date *" 
            type="date" 
            value={form.bill_date} 
            onChange={(e) => setForm(f => ({ ...f, bill_date: e.target.value }))}
            required
          />

          <Input 
            label="Due Date" 
            type="date" 
            value={form.due_date} 
            onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
          />

          <Input 
            label="Amount *" 
            type="number" 
            step="0.01"
            value={form.amount} 
            onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
            placeholder="0.00"
            required
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'Unpaid', label: 'Unpaid' }, 
              { value: 'Paid', label: 'Paid' },
              { value: 'Overdue', label: 'Overdue' }
            ]}
          />
        </div>

        <div className="mt-6">
          <Input 
            label="Description" 
            type="textarea" 
            value={form.description} 
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Enter bill description or notes"
            rows={3}
          />
        </div>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={submit} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          <span>💰</span>
          {saving ? 'Creating Bill...' : 'Create Bill'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/bills')}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default VendorBillCreate;
