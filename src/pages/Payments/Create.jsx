import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { vendorBillsAPI, paymentsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PaymentCreate = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ vendor_bill_id: '', amount: 0, paid_at: new Date().toISOString().slice(0,10) });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await vendorBillsAPI.getAll();
        setBills(res.data || []);
      } catch (e) {}
    };
    load();
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await paymentsAPI.create(form);
      navigate('/payments');
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Record Payment</h2>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Vendor Bill"
            value={form.vendor_bill_id}
            onChange={(e) => setForm((f) => ({ ...f, vendor_bill_id: e.target.value }))}
            options={[{ value: '', label: 'Select Bill' }, ...bills.map(b => ({ value: b.id, label: `Bill ${b.id}` }))]}
          />
          <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Paid At" type="date" value={form.paid_at} onChange={(e) => setForm((f) => ({ ...f, paid_at: e.target.value }))} />
        </div>
      </Card>
      <div>
        <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Payment'}</Button>
      </div>
    </div>
  );
};

export default PaymentCreate;
