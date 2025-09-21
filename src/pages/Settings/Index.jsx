import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import { healthAPI, hsnAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const [apiHealthy, setApiHealthy] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const [hsnList, setHsnList] = useState([]);
  const [hsnSearch, setHsnSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({ hsn_code: '', description: '', tax_percent: '' });
  const [editing, setEditing] = useState(null); // id or code
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        const params = {};
        if (hsnSearch.trim()) params['hsn_code'] = `ilike.*${hsnSearch.trim()}*`;
        params['order'] = 'hsn_code.asc';
        const res = await hsnAPI.getAll(params, { Range: `${start}-${end}`, Prefer: 'count=exact' });
        setHsnList(res.data || []);
        const cr = res.headers['content-range'] || res.headers['Content-Range'] || '*/0';
        setTotal(Number(cr.split('/')[1]) || 0);
      } catch (e) {}
    };
    load();
  }, [page, hsnSearch]);

  const columns = useMemo(() => ([
    { key: 'hsn_code', title: 'HSN Code' },
    { key: 'description', title: 'Description' },
    { key: 'tax_percent', title: 'Tax %' },
  ]), []);

  const resetForm = () => {
    setForm({ hsn_code: '', description: '', tax_percent: '' });
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.hsn_code?.trim()) {
      show('HSN Code is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        hsn_code: form.hsn_code.trim(),
        description: form.description?.trim() || null,
        tax_percent: form.tax_percent === '' ? null : Number(form.tax_percent),
      };
      if (editing) await hsnAPI.update(editing, payload);
      else await hsnAPI.create(payload);
      show('HSN saved', 'success');
      resetForm();
      // reload first page
      setPage(1);
      setHsnSearch('');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.hint || e?.message || 'Failed to save HSN';
      show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row) => {
    setEditing(row.id || row.hsn_code);
    setForm({ hsn_code: row.hsn_code || '', description: row.description || '', tax_percent: row.tax_percent ?? '' });
  };

  const onDelete = async (row) => {
    try {
      await hsnAPI.delete(row.id || row.hsn_code);
      show('HSN deleted', 'success');
      // Soft refresh current page
      setHsnList((list) => list.filter((x) => (x.id || x.hsn_code) !== (row.id || row.hsn_code)));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.hint || e?.message || 'Failed to delete HSN';
      show(msg, 'error');
    }
  };

  const ping = async () => {
    setLoadingHealth(true);
    try {
      await healthAPI.ping();
      setApiHealthy(true);
      show('API is reachable', 'success');
    } catch {
      setApiHealthy(false);
      show('API is not reachable', 'error');
    } finally {
      setLoadingHealth(false);
    }
  };

  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin Settings</h1>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">API Health</div>
            <div className="text-sm text-gray-500">Check connectivity with PostgREST</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-sm ${apiHealthy == null ? 'text-gray-400' : apiHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {apiHealthy == null ? 'Unknown' : apiHealthy ? 'Healthy' : 'Unreachable'}
            </div>
            <Button onClick={ping} disabled={loadingHealth} className="bg-gray-600 hover:bg-gray-700">{loadingHealth ? 'Checking...' : 'Ping'}</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">HSN Cache</h2>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search HSN..."
              className="px-3 py-2 border rounded-md text-sm"
              value={hsnSearch}
              onChange={(e) => { setPage(1); setHsnSearch(e.target.value); }}
            />
          </div>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4" onSubmit={submit}>
          <Input label="HSN Code" name="hsn_code" value={form.hsn_code} onChange={(e) => setForm((f) => ({ ...f, hsn_code: e.target.value }))} required />
          <Input label="Description" name="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Tax %" name="tax_percent" type="number" value={form.tax_percent} onChange={(e) => setForm((f) => ({ ...f, tax_percent: e.target.value }))} />
          <div className="flex items-end">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Update' : 'Add')}</Button>
            {editing && (
              <Button type="button" className="ml-2 bg-gray-600 hover:bg-gray-700" onClick={resetForm}>Cancel</Button>
            )}
          </div>
        </form>

        <Table
          columns={columns}
          data={hsnList}
          renderActions={(row) => (
            <div className="space-x-3">
              <button className="text-primary-600 hover:underline" onClick={() => onEdit(row)}>Edit</button>
              <button className="text-red-600 hover:underline" onClick={() => onDelete(row)}>Delete</button>
            </div>
          )}
        />
        <div className="flex items-center justify-between mt-4 text-sm">
          <div>Page {page} of {Math.max(1, Math.ceil(total / pageSize))} • Total {total}</div>
          <div className="space-x-2">
            <Button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="bg-gray-600 hover:bg-gray-700">Prev</Button>
            <Button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)} className="bg-gray-600 hover:bg-gray-700">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
