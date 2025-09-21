import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  purchaseOrdersAPI, 
  vendorBillsAPI, 
  paymentsAPI, 
  vendorsAPI, 
  productsAPI 
} from '../services/api';

const Reports = () => {
  const { user } = useAuth();
  const { show } = useToast();
  const role = user?.role;

  // Date filters
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Default to last month
    return date.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Loading states
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    purchaseOrders: [],
    vendorBills: [],
    payments: [],
    vendors: [],
    products: []
  });

  // Report states
  const [activeReport, setActiveReport] = useState('summary');
  const [selectedVendor, setSelectedVendor] = useState('');

  // Load initial data
  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [ordersRes, billsRes, paymentsRes, vendorsRes, productsRes] = await Promise.all([
        purchaseOrdersAPI.getAll(),
        vendorBillsAPI.getAll(),
        paymentsAPI.getAll(),
        vendorsAPI.getAll(),
        productsAPI.getAll()
      ]);

      setReportData({
        purchaseOrders: ordersRes.data || [],
        vendorBills: billsRes.data || [],
        payments: paymentsRes.data || [],
        vendors: vendorsRes.data || [],
        products: productsRes.data || []
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      show('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate report metrics
  const getReportMetrics = () => {
    const { purchaseOrders, vendorBills, payments, vendors, products } = reportData;
    
    // Filter by date range
    const filteredOrders = purchaseOrders.filter(order => {
      const orderDate = new Date(order.created_at || order.po_date);
      return orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
    });
    
    const filteredBills = vendorBills.filter(bill => {
      const billDate = new Date(bill.created_at || bill.bill_date);
      return billDate >= new Date(fromDate) && billDate <= new Date(toDate);
    });
    
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.created_at || payment.payment_date);
      return paymentDate >= new Date(fromDate) && paymentDate <= new Date(toDate);
    });

    // Calculate totals
    const totalPurchaseOrders = filteredOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const totalBills = filteredBills.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
    const totalPayments = filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const outstandingBills = totalBills - totalPayments;

    return {
      totalPurchaseOrders,
      totalBills,
      totalPayments,
      outstandingBills,
      ordersCount: filteredOrders.length,
      billsCount: filteredBills.length,
      paymentsCount: filteredPayments.length,
      vendorsCount: vendors.length,
      productsCount: products.length,
      filteredOrders,
      filteredBills,
      filteredPayments
    };
  };

  const metrics = getReportMetrics();

  // Vendor performance analysis
  const getVendorAnalysis = () => {
    const vendorMap = new Map();
    reportData.vendors.forEach(vendor => {
      vendorMap.set(vendor.id, { ...vendor, orders: 0, bills: 0, payments: 0, totalAmount: 0 });
    });

    metrics.filteredOrders.forEach(order => {
      if (vendorMap.has(order.vendor_id)) {
        const vendor = vendorMap.get(order.vendor_id);
        vendor.orders += 1;
        vendor.totalAmount += Number(order.total_amount) || 0;
      }
    });

    metrics.filteredBills.forEach(bill => {
      if (vendorMap.has(bill.vendor_id)) {
        const vendor = vendorMap.get(bill.vendor_id);
        vendor.bills += 1;
      }
    });

    return Array.from(vendorMap.values()).filter(vendor => vendor.orders > 0 || vendor.bills > 0);
  };

  const vendorAnalysis = getVendorAnalysis();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading report data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Business insights and financial reports</p>
        </div>
        <Button onClick={loadReportData} disabled={loading} variant="outline">
          🔄 Refresh Data
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card title="Report Filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Select
            label="Report Type"
            value={activeReport}
            onChange={(e) => setActiveReport(e.target.value)}
            options={[
              { value: 'summary', label: 'Summary Dashboard' },
              { value: 'purchase', label: 'Purchase Analysis' },
              { value: 'vendor', label: 'Vendor Performance' },
              { value: 'financial', label: 'Financial Overview' }
            ]}
          />
          <div className="flex items-end">
            <Button onClick={loadReportData} className="w-full">
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Dashboard */}
      {activeReport === 'summary' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="text-center">
                <div className="text-blue-100">Purchase Orders</div>
                <div className="text-2xl font-bold">{metrics.ordersCount}</div>
                <div className="text-sm text-blue-200">₹{metrics.totalPurchaseOrders.toLocaleString()}</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="text-center">
                <div className="text-green-100">Vendor Bills</div>
                <div className="text-2xl font-bold">{metrics.billsCount}</div>
                <div className="text-sm text-green-200">₹{metrics.totalBills.toLocaleString()}</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="text-center">
                <div className="text-purple-100">Payments Made</div>
                <div className="text-2xl font-bold">{metrics.paymentsCount}</div>
                <div className="text-sm text-purple-200">₹{metrics.totalPayments.toLocaleString()}</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="text-center">
                <div className="text-red-100">Outstanding</div>
                <div className="text-2xl font-bold">₹{metrics.outstandingBills.toLocaleString()}</div>
                <div className="text-sm text-red-200">{metrics.billsCount - metrics.paymentsCount} bills</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Recent Purchase Orders">
              <div className="space-y-3">
                {metrics.filteredOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="font-medium">PO #{order.id}</div>
                      <div className="text-sm text-gray-600">Vendor ID: {order.vendor_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{Number(order.total_amount || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{order.status}</div>
                    </div>
                  </div>
                ))}
                {metrics.filteredOrders.length === 0 && (
                  <div className="text-center py-4 text-gray-500">No purchase orders in selected period</div>
                )}
              </div>
            </Card>

            <Card title="Recent Bills">
              <div className="space-y-3">
                {metrics.filteredBills.slice(0, 5).map(bill => (
                  <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="font-medium">Bill #{bill.bill_number || bill.id}</div>
                      <div className="text-sm text-gray-600">Vendor ID: {bill.vendor_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{Number(bill.amount || 0).toLocaleString()}</div>
                      <div className={`text-sm ${bill.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {bill.status}
                      </div>
                    </div>
                  </div>
                ))}
                {metrics.filteredBills.length === 0 && (
                  <div className="text-center py-4 text-gray-500">No bills in selected period</div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Vendor Performance Report */}
      {activeReport === 'vendor' && (
        <Card title="Vendor Performance Analysis">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Vendor Name</th>
                  <th className="text-center py-3 px-4">Purchase Orders</th>
                  <th className="text-center py-3 px-4">Bills</th>
                  <th className="text-right py-3 px-4">Total Amount</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendorAnalysis.map(vendor => (
                  <tr key={vendor.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 font-medium">{vendor.name}</td>
                    <td className="py-3 px-4 text-center">{vendor.orders}</td>
                    <td className="py-3 px-4 text-center">{vendor.bills}</td>
                    <td className="py-3 px-4 text-right font-bold">₹{vendor.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {vendorAnalysis.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No vendor activity in selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Financial Overview */}
      {activeReport === 'financial' && (role === 'admin' || role === 'accounts') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Cash Flow Summary">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <span className="text-red-800 dark:text-red-400">Total Outgoing (Bills)</span>
                <span className="font-bold text-red-800 dark:text-red-400">₹{metrics.totalBills.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="text-green-800 dark:text-green-400">Total Paid</span>
                <span className="font-bold text-green-800 dark:text-green-400">₹{metrics.totalPayments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <span className="text-yellow-800 dark:text-yellow-400">Outstanding Balance</span>
                <span className="font-bold text-yellow-800 dark:text-yellow-400">₹{metrics.outstandingBills.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card title="Payment Status">
            <div className="space-y-3">
              <div className="text-sm text-gray-600">Payment Completion Rate</div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${metrics.totalBills > 0 ? (metrics.totalPayments / metrics.totalBills) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {metrics.totalBills > 0 ? Math.round((metrics.totalPayments / metrics.totalBills) * 100) : 0}% of bills paid
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
