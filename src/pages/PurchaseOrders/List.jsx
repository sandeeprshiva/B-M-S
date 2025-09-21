import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { purchaseOrdersAPI, vendorsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const PurchaseOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        console.log('Loading purchase orders...');
        const [ordersRes, vendorsRes] = await Promise.all([
          purchaseOrdersAPI.getAll(),
          vendorsAPI.getAll()
        ]);
        
        console.log('Orders response:', ordersRes);
        console.log('Vendors response:', vendorsRes);
        
        setOrders(ordersRes.data || []);
        setVendors(vendorsRes.data || []);
        
        if (ordersRes.data?.length === 0) {
          show('No purchase orders found. Create your first PO!', 'info');
        }
      } catch (e) {
        console.error('Error loading purchase orders:', e);
        show('Failed to load purchase orders', 'error');
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
    { key: 'id', title: 'PO #' },
    { 
      key: 'vendor_id', 
      title: 'Vendor',
      render: (vendorId) => vendorMap.get(vendorId) || `Vendor ${vendorId}`
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
          status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      )
    },
    { 
      key: 'total_amount', 
      title: 'Amount',
      render: (amount) => amount ? `₹${Number(amount).toLocaleString()}` : '-'
    },
    { 
      key: 'created_at', 
      title: 'Date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
  ];

  const canCreatePO = user?.role === 'admin' || user?.role === 'purchase';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage purchase orders and track procurement
          </p>
        </div>
        {canCreatePO && (
          <Link to="/orders/new">
            <Button className="flex items-center gap-2">
              <span>📄</span>
              New Purchase Order
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100">Confirmed</p>
            <p className="text-2xl font-bold">{orders.filter(o => o.status === 'Confirmed').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="text-center">
            <p className="text-yellow-100">Draft</p>
            <p className="text-2xl font-bold">{orders.filter(o => o.status === 'Draft').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-purple-100">Total Value</p>
            <p className="text-2xl font-bold">
              ₹{orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading purchase orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Purchase Orders</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first purchase order
            </p>
            {canCreatePO && (
              <Link to="/orders/new">
                <Button>Create Purchase Order</Button>
              </Link>
            )}
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={orders}
            renderActions={(row) => (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">View</Button>
                {canCreatePO && <Button variant="outline" size="sm">Edit</Button>}
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default PurchaseOrdersList;
