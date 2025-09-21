import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { roleDescriptions } from '../../utils/roleRedirect';

const SalesDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlyRevenue: 0,
    activeProducts: 0,
    lowStockItems: 0
  });

  const roleInfo = roleDescriptions[user?.role] || roleDescriptions.sales;

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalSales: 156,
      monthlyRevenue: 45780,
      activeProducts: 89,
      lowStockItems: 12
    });
  }, []);

  const StatCard = ({ title, value, icon, color = 'blue', link }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    };

    const content = (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={`${colors[color]} p-3 rounded-lg`}>
            <span className="text-white text-xl">{icon}</span>
          </div>
        </div>
      </div>
    );

    return link ? <Link to={link}>{content}</Link> : content;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mb-4">{roleInfo.description}</p>
        <div className="flex flex-wrap gap-2">
          {roleInfo.primaryActions.map((action, index) => (
            <span key={index} className="bg-blue-500/30 px-3 py-1 rounded-full text-sm">
              {action}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales This Month"
          value={stats.totalSales}
          icon="💰"
          color="green"
          link="/sales"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          icon="📈"
          color="blue"
          link="/analytics"
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon="📦"
          color="blue"
          link="/products"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon="⚠️"
          color="red"
          link="/inventory"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions" subtitle="Common sales tasks">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/sales/new" className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left block">
              <div className="text-lg mb-1">💰</div>
              <div className="text-sm font-medium">New Sale</div>
            </Link>
            <Link to="/inventory" className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left block">
              <div className="text-lg mb-1">📦</div>
              <div className="text-sm font-medium">Check Inventory</div>
            </Link>
            <Link to="/products/new" className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left block">
              <div className="text-lg mb-1">🏷️</div>
              <div className="text-sm font-medium">Add Product</div>
            </Link>
            <Link to="/analytics" className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left block">
              <div className="text-lg mb-1">📊</div>
              <div className="text-sm font-medium">View Analytics</div>
            </Link>
          </div>
        </Card>

        <Card title="Recent Activity" subtitle="Latest sales activities">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">💰</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Sale completed - ₹2,450</div>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm">📦</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Low stock alert - Widget A</div>
                <div className="text-xs text-gray-500">4 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-sm">🏷️</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">New product added</div>
                <div className="text-xs text-gray-500">1 day ago</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesDashboard;
