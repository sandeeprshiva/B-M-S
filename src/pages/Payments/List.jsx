import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { paymentsAPI } from '../../services/api';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await paymentsAPI.getAll();
        setPayments(res.data || []);
      } catch (e) {}
    };
    load();
  }, []);

  const columns = [
    { key: 'id', title: 'Payment #' },
    { key: 'vendor_bill_id', title: 'Bill #' },
    { key: 'amount', title: 'Amount' },
    { key: 'paid_at', title: 'Date' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payments</h2>
        <Link to="/payments/new"><Button>Record Payment</Button></Link>
      </div>
      <Card>
        <Table columns={columns} data={payments} />
      </Card>
    </div>
  );
};

export default PaymentsList;
