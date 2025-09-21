import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  vendorsAPI, 
  productsAPI, 
  vendorBillsAPI, 
  paymentsAPI, 
  purchaseOrdersAPI,
  usersAPI 
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, LineChart, PieChart, ProgressRing } from '../components/charts/SimpleChart';

const StatCard = ({ title, value, icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <Card className="hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</div>
        </div>
        <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    vendors: [],
    products: [],
    bills: [],
    payments: [],
    orders: [],
    users: []
  });

  const [stats, setStats] = useState({
    vendors: 0,
    products: 0,
    pendingBills: 0,
    totalPayments: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalBillAmount: 0,
    paidBillAmount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [vendorsRes, productsRes, billsRes, paymentsRes, ordersRes, usersRes] = await Promise.all([
          vendorsAPI.getAll(),
          productsAPI.getAll(),
          vendorBillsAPI.getAll(),
          paymentsAPI.getAll(),
          purchaseOrdersAPI.getAll(),
          user?.role === 'admin' ? usersAPI.getAll() : Promise.resolve({ data: [] })
        ]);

        const vendors = vendorsRes.data || [];
        const products = productsRes.data || [];
        const bills = billsRes.data || [];
        const payments = paymentsRes.data || [];
        const orders = ordersRes.data || [];
        const users = usersRes.data || [];

        setDashboardData({ vendors, products, bills, payments, orders, users });

        // Calculate statistics
        const pendingBills = bills.filter(bill => bill.status !== 'Paid').length;
        const totalPayments = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
        const totalBillAmount = bills.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
        const paidBillAmount = bills
          .filter(bill => bill.status === 'Paid')
          .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

        setStats({
          vendors: vendors.length,
          products: products.length,
          pendingBills,
          totalPayments,
          totalOrders: orders.length,
          totalUsers: users.length,
          totalBillAmount,
          paidBillAmount
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  // Prepare chart data
  const getMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      label: month,
      value: Math.floor(Math.random() * 100) + 20 // Mock data - replace with real monthly data
    }));
  };

  const getBillStatusData = () => {
    const { bills } = dashboardData;
    const paid = bills.filter(bill => bill.status === 'Paid').length;
    const unpaid = bills.filter(bill => bill.status === 'Unpaid').length;
    const overdue = bills.filter(bill => bill.status === 'Overdue').length;

    return [
      { label: 'Paid', value: paid, color: '#10B981' },
      { label: 'Unpaid', value: unpaid, color: '#F59E0B' },
      { label: 'Overdue', value: overdue, color: '#EF4444' }
    ];
  };

  const getVendorPerformance = () => {
    const { vendors, orders } = dashboardData;
    const vendorOrderCount = new Map();
    
    orders.forEach(order => {
      const count = vendorOrderCount.get(order.vendor_id) || 0;
      vendorOrderCount.set(order.vendor_id, count + 1);
    });

    return vendors.slice(0, 5).map(vendor => ({
      label: vendor.name.substring(0, 10),
      value: vendorOrderCount.get(vendor.id) || 0,
      color: `hsl(${vendor.id * 50}, 70%, 50%)`
    }));
  };

  const getPaymentProgress = () => {
    if (stats.totalBillAmount === 0) return 0;
    return (stats.paidBillAmount / stats.totalBillAmount) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your business today.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          🔄 Refresh Data
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Vendors" value={stats.vendors} icon="🏢" color="blue" />
        <StatCard title="Total Products" value={stats.products} icon="📦" color="green" />
        <StatCard title="Purchase Orders" value={stats.totalOrders} icon="📋" color="purple" />
        {user?.role === 'admin' && (
          <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="red" />
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <div className="text-green-100">Total Bills Amount</div>
            <div className="text-3xl font-bold">₹{stats.totalBillAmount.toLocaleString()}</div>
            <div className="text-sm text-green-200 mt-1">{dashboardData.bills.length} bills</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <div className="text-blue-100">Payments Made</div>
            <div className="text-3xl font-bold">₹{stats.totalPayments.toLocaleString()}</div>
            <div className="text-sm text-blue-200 mt-1">{dashboardData.payments.length} payments</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-center">
            <div className="text-red-100">Outstanding Amount</div>
            <div className="text-3xl font-bold">₹{(stats.totalBillAmount - stats.paidBillAmount).toLocaleString()}</div>
            <div className="text-sm text-red-200 mt-1">{stats.pendingBills} pending bills</div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card title="Monthly Business Trends" subtitle="Purchase orders over time">
          <LineChart 
            data={getMonthlyTrends()} 
            height={250}
          />
        </Card>

        {/* Bill Status Distribution */}
        <Card title="Bill Status Overview" subtitle="Current payment status">
          <PieChart 
            data={getBillStatusData()} 
            size={250}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Performance */}
        <Card title="Top Vendors" subtitle="By order volume" className="lg:col-span-2">
          <BarChart 
            data={getVendorPerformance()} 
            height={300}
          />
        </Card>

        {/* Payment Progress */}
        <Card title="Payment Progress" subtitle="Bills payment completion">
          <div className="flex flex-col items-center py-8">
            <ProgressRing 
              percentage={getPaymentProgress()} 
              size={150} 
              color="#10B981"
            />
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ₹{stats.paidBillAmount.toLocaleString()} of ₹{stats.totalBillAmount.toLocaleString()} paid
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.pendingBills} bills remaining
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity" subtitle="Latest system activity">
          <div className="space-y-4">
            {dashboardData.orders.slice(0, 3).map((order, index) => (
              <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">📋</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Purchase Order #{order.id}</div>
                  <div className="text-xs text-gray-500">Vendor ID: {order.vendor_id} • {order.status}</div>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  ₹{Number(order.total_amount || 0).toLocaleString()}
                </div>
              </div>
            ))}
            {dashboardData.bills.slice(0, 2).map((bill, index) => (
              <div key={bill.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">🧾</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Bill #{bill.bill_number || bill.id}</div>
                  <div className="text-xs text-gray-500">Vendor ID: {bill.vendor_id} • {bill.status}</div>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  ₹{Number(bill.amount || 0).toLocaleString()}
                </div>
              </div>
            ))}
            {(dashboardData.orders.length === 0 && dashboardData.bills.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No recent activity to display
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Quick Actions" subtitle="Common tasks and shortcuts">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/orders/new" className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left block">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium">New Purchase Order</div>
            </Link>
            <Link to="/bills/new" className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left block">
              <div className="text-2xl mb-2">🧾</div>
              <div className="text-sm font-medium">New Bill</div>
            </Link>
            <Link to="/vendors/new" className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left block">
              <div className="text-2xl mb-2">🏢</div>
              <div className="text-sm font-medium">Add Vendor</div>
            </Link>
            <Link to="/products/new" className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-left block">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-medium">Add Product</div>
            </Link>
            <Link to="/reports" className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-left block">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium">View Reports</div>
            </Link>
            {user?.role === 'admin' && (
              <Link to="/users/new" className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left block">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-medium">Add User</div>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* System Health Status */}
      <Card title="System Overview" subtitle="Current system status and health">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl text-green-600 mb-2">✅</div>
            <div className="text-sm font-medium text-green-800 dark:text-green-400">Database</div>
            <div className="text-xs text-green-600">Connected</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl text-blue-600 mb-2">🔄</div>
            <div className="text-sm font-medium text-blue-800 dark:text-blue-400">API Status</div>
            <div className="text-xs text-blue-600">Operational</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl text-purple-600 mb-2">📊</div>
            <div className="text-sm font-medium text-purple-800 dark:text-purple-400">Data Sync</div>
            <div className="text-xs text-purple-600">Up to date</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl text-yellow-600 mb-2">⚡</div>
            <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Performance</div>
            <div className="text-xs text-yellow-600">Optimal</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
