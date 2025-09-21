import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { vendorBillsAPI, vendorsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const VendorBillsList = () => {
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        console.log('Loading vendor bills...');
        const [billsRes, vendorsRes] = await Promise.all([
          vendorBillsAPI.getAll(),
          vendorsAPI.getAll()
        ]);
        
        console.log('Bills response:', billsRes);
        console.log('Vendors response:', vendorsRes);
        
        setBills(billsRes.data || []);
        setVendors(vendorsRes.data || []);
        
        if (billsRes.data?.length === 0) {
          show('No vendor bills found. Create your first bill!', 'info');
        }
      } catch (e) {
        console.error('Error loading bills:', e);
        show('Failed to load vendor bills', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  // Create vendor lookup map
  const vendorMap = React.useMemo(() => {
    const map = new Map();
    vendors.forEach(v => map.set(v.id, v.name));
    return map;
  }, [vendors]);

  const columns = [
    { key: 'id', title: 'Bill #' },
    { 
      key: 'bill_number', 
      title: 'Bill Number',
      render: (billNumber) => billNumber || '-'
    },
    { 
      key: 'vendor_id', 
      title: 'Vendor',
      render: (vendorId) => vendorMap.get(vendorId) || `Vendor ${vendorId}`
    },
    { 
      key: 'purchase_order_id', 
      title: 'PO #',
      render: (poId) => poId ? `PO #${poId}` : '-'
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'Paid' ? 'bg-green-100 text-green-800' : 
          status === 'Overdue' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </span>
      )
    },
    { 
      key: 'amount', 
      title: 'Amount',
      render: (amount) => `₹${Number(amount || 0).toLocaleString()}`
    },
    { 
      key: 'bill_date', 
      title: 'Bill Date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
  ];

  const canCreateBill = user?.role === 'admin' || user?.role === 'accounts' || user?.role === 'purchase';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Bills</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vendor bills and track payments
          </p>
        </div>
        {canCreateBill && (
          <Link to="/bills/new">
            <Button className="flex items-center gap-2">
              <span>💰</span>
              New Bill
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100">Total Bills</p>
            <p className="text-2xl font-bold">{bills.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100">Paid</p>
            <p className="text-2xl font-bold">{bills.filter(b => b.status === 'Paid').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="text-center">
            <p className="text-yellow-100">Unpaid</p>
            <p className="text-2xl font-bold">{bills.filter(b => b.status === 'Unpaid').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-center">
            <p className="text-red-100">Overdue</p>
            <p className="text-2xl font-bold">{bills.filter(b => b.status === 'Overdue').length}</p>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading vendor bills...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Vendor Bills</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first vendor bill
            </p>
            {canCreateBill && (
              <Link to="/bills/new">
                <Button>Create Vendor Bill</Button>
              </Link>
            )}
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={bills}
            renderActions={(row) => (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">View</Button>
                {canCreateBill && <Button variant="outline" size="sm">Edit</Button>}
                {row.status === 'Unpaid' && canCreateBill && (
                  <Button variant="success" size="sm">Pay</Button>
                )}
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default VendorBillsList;
