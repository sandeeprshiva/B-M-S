import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { productsAPI } from '../../services/api';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        const params = {};
        if (search.trim()) params['name'] = `ilike.*${search.trim()}*`;
        params['order'] = 'name.asc';
        
        const res = await productsAPI.getAll(params, {
          Range: `${start}-${end}`,
          Prefer: 'count=exact',
        });
        setInventory(res.data || []);
        const cr = res.headers['content-range'] || res.headers['Content-Range'] || '*/0';
        setTotal(Number(cr.split('/')[1]) || 0);
      } catch (e) {}
    };
    load();
  }, [page, search]);

  const columns = [
    { key: 'name', title: 'Product Name' },
    { key: 'category', title: 'Category' },
    { key: 'hsn_code', title: 'HSN Code' },
    { 
      key: 'stock', 
      title: 'Stock',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value > 10 ? 'bg-green-100 text-green-800' : 
          value > 0 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {value || 0}
        </span>
      )
    },
    { 
      key: 'sales_price', 
      title: 'Sale Price',
      render: (value) => `₹${value || 0}`
    },
    { 
      key: 'purchase_price', 
      title: 'Purchase Price',
      render: (value) => `₹${value || 0}`
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search products..."
            icon="🔍"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="w-64"
          />
          <Link to="/products/new">
            <Button>Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Products</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">In Stock</p>
              <p className="text-2xl font-bold">{inventory.filter(i => i.stock > 0).length}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Low Stock</p>
              <p className="text-2xl font-bold">{inventory.filter(i => i.stock <= 10 && i.stock > 0).length}</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Out of Stock</p>
              <p className="text-2xl font-bold">{inventory.filter(i => i.stock === 0).length}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          data={inventory}
          renderActions={(row) => (
            <div className="flex items-center gap-2">
              <Link to={`/products/${row.id}`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
              <Button variant="outline" size="sm">Adjust Stock</Button>
            </div>
          )}
        />
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} products
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded">
              {page} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={page >= Math.ceil(total / pageSize)} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InventoryList;
