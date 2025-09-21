import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { vendorsAPI } from '../../services/api';

const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        const params = {};
        if (search.trim()) params['name'] = `ilike.*${search.trim()}*`;
        params['order'] = `name.${sortAsc ? 'asc' : 'desc'}`;
        const res = await vendorsAPI.getAll(params, {
          Range: `${start}-${end}`,
          Prefer: 'count=exact',
        });
        setVendors(res.data || []);
        const contentRange = res.headers['content-range'] || res.headers['Content-Range'];
        if (contentRange) {
          const totalStr = contentRange.split('/')[1];
          setTotal(Number(totalStr) || 0);
        }
      } catch (e) {}
    };
    load();
  }, [page, search, sortAsc]);

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'gstin', title: 'GSTIN' },
    { key: 'phone', title: 'Phone' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vendors</h2>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search name..."
            className="px-3 py-2 border rounded-md text-sm"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
          <Button type="button" onClick={() => setSortAsc((v) => !v)} className="bg-gray-600 hover:bg-gray-700">
            Sort {sortAsc ? '▲' : '▼'}
          </Button>
          <Link to="/vendors/new"><Button>Add Vendor</Button></Link>
        </div>
      </div>
      <Card>
        <Table
          columns={columns}
          data={vendors}
          renderActions={(row) => (
            <Link to={`/vendors/${row.id}`} className="text-primary-600 hover:underline">Edit</Link>
          )}
        />
        <div className="flex items-center justify-between mt-4 text-sm">
          <div>
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))} • Total {total}
          </div>
          <div className="space-x-2">
            <Button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="bg-gray-600 hover:bg-gray-700">Prev</Button>
            <Button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)} className="bg-gray-600 hover:bg-gray-700">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VendorsList;
