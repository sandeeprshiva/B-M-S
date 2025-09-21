import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [analytics, setAnalytics] = useState({
    revenue: { current: 125000, previous: 98000, growth: 27.5 },
    orders: { current: 156, previous: 142, growth: 9.9 },
    customers: { current: 89, previous: 76, growth: 17.1 },
    avgOrderValue: { current: 801, previous: 690, growth: 16.1 }
  });

  const [salesTrend, setSalesTrend] = useState([
    { month: 'Jan', sales: 45000, orders: 45 },
    { month: 'Feb', sales: 52000, orders: 52 },
    { month: 'Mar', sales: 48000, orders: 48 },
    { month: 'Apr', sales: 61000, orders: 58 },
    { month: 'May', sales: 55000, orders: 55 },
    { month: 'Jun', sales: 67000, orders: 63 }
  ]);

  const [topProducts, setTopProducts] = useState([
    { name: 'Product A', sales: 25000, quantity: 125, growth: 15.2 },
    { name: 'Product B', sales: 18500, quantity: 92, growth: -5.1 },
    { name: 'Product C', sales: 16200, quantity: 81, growth: 22.8 },
    { name: 'Product D', sales: 14800, quantity: 74, growth: 8.3 },
    { name: 'Product E', sales: 12100, quantity: 60, growth: -2.4 }
  ]);

  const MetricCard = ({ title, value, previousValue, growth, icon, color = 'blue' }) => {
    const isPositive = growth > 0;
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };

    return (
      <Card className={`bg-gradient-to-r ${colorClasses[color]} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">{title}</p>
            <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <div className="flex items-center mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${isPositive ? 'bg-white/20' : 'bg-red-500/20'}`}>
                {isPositive ? '↗' : '↘'} {Math.abs(growth)}%
              </span>
            </div>
          </div>
          <div className="text-3xl opacity-80">{icon}</div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your business performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          {['7days', '30days', '90days', '1year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7days' ? '7D' : range === '30days' ? '30D' : range === '90days' ? '90D' : '1Y'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${analytics.revenue.current.toLocaleString()}`}
          growth={analytics.revenue.growth}
          icon="💰"
          color="blue"
        />
        <MetricCard
          title="Total Orders"
          value={analytics.orders.current}
          growth={analytics.orders.growth}
          icon="📦"
          color="green"
        />
        <MetricCard
          title="New Customers"
          value={analytics.customers.current}
          growth={analytics.customers.growth}
          icon="👥"
          color="purple"
        />
        <MetricCard
          title="Avg Order Value"
          value={`₹${analytics.avgOrderValue.current}`}
          growth={analytics.avgOrderValue.growth}
          icon="📊"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card title="Sales Trend" subtitle="Monthly sales performance">
          <div className="space-y-4">
            {salesTrend.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {item.month}
                  </div>
                  <div>
                    <p className="font-medium">₹{item.sales.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{item.orders} orders</p>
                  </div>
                </div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(item.sales / Math.max(...salesTrend.map(s => s.sales))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card title="Top Selling Products" subtitle="Best performing products this period">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{product.sales.toLocaleString()}</p>
                  <p className={`text-xs ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.growth > 0 ? '+' : ''}{product.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Customer Insights">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Returning Customers</span>
              <span className="font-bold">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Lifetime Value</span>
              <span className="font-bold">₹2,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Churn Rate</span>
              <span className="font-bold text-red-600">12%</span>
            </div>
          </div>
        </Card>

        <Card title="Inventory Status">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="font-bold text-yellow-600">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-bold text-red-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Products</span>
              <span className="font-bold">156</span>
            </div>
          </div>
        </Card>

        <Card title="Financial Health">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Margin</span>
              <span className="font-bold text-green-600">42%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Profit Margin</span>
              <span className="font-bold text-green-600">18%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ROI</span>
              <span className="font-bold text-green-600">24%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
