import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { vendorsAPI, productsAPI, purchaseOrdersAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { calculateOrderTotals, createPurchaseOrderWithLines } from '../../utils/orders';

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    po_number: '',
    vendor_id: '', 
    po_date: new Date().toISOString().slice(0, 10),
    reference: '',
    status: 'Draft'
  });
  // Updated to match purchase_order_lines table schema exactly
  const [lines, setLines] = useState([{ 
    product_id: '', 
    qty: 1, 
    unit_price: 0, 
    tax_percent: 0,
    total: 0 
  }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [vendorsRes, productsRes] = await Promise.all([
          vendorsAPI.getAll(), 
          productsAPI.getAll()
        ]);
        setVendors(vendorsRes.data || []);
        setProducts(productsRes.data || []);
        if (!vendorsRes.data?.length) {
          show('No vendors available. Please add vendors first.', 'warning');
        }
        if (!productsRes.data?.length) {
          show('No products available. Please add products first.', 'warning');
        }
      } catch (e) {
        show('Failed to load data. Please refresh and try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  const addLine = () => {
    if (!products.length) {
      show('No products available to add', 'error');
      return;
    }
    setLines(prevLines => [...prevLines, { 
      product_id: '', 
      qty: 1, 
      unit_price: 0, 
      tax_percent: 0,
      total: 0 
    }]);
  };

  const updateLine = (idx, patch) => {
    setLines(prevLines => prevLines.map((line, i) => {
      if (i === idx) {
        const updatedLine = { ...line, ...patch };
        // Calculate line total: (qty * unit_price) + ((qty * unit_price) * tax_percent / 100)
        const subtotal = Number(updatedLine.qty) * Number(updatedLine.unit_price);
        const taxAmount = subtotal * (Number(updatedLine.tax_percent) / 100);
        updatedLine.total = subtotal + taxAmount;
        return updatedLine;
      }
      return line;
    }));
  };

  const removeLine = (idx) => {
    if (lines.length <= 1) {
      show('At least one line item is required', 'error');
      return;
    }
    setLines(prevLines => prevLines.filter((_, i) => i !== idx));
  };

  const productsById = React.useMemo(() => {
    const map = new Map();
    products.forEach(p => map.set(String(p.id), p));
    return map;
  }, [products]);

  const totals = React.useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      return sum + (Number(line.qty) * Number(line.unit_price));
    }, 0);
    
    const totalTax = lines.reduce((sum, line) => {
      const lineSubtotal = Number(line.qty) * Number(line.unit_price);
      return sum + (lineSubtotal * (Number(line.tax_percent) / 100));
    }, 0);
    
    const total = subtotal + totalTax;
    
    return { subtotal, tax: totalTax, total };
  }, [lines]);

  const validLinesCount = React.useMemo(() => {
    return lines.filter(line => {
      const productId = line.product_id && String(line.product_id).trim();
      const quantity = Number(line.qty) || 0;
      return productId && quantity > 0;
    }).length;
  }, [lines]);

  const canSubmit = form.vendor_id && validLinesCount > 0 && !saving;

  const submit = async () => {
    if (!form.vendor_id) {
      show('Please select a vendor', 'error');
      return;
    }

    if (validLinesCount === 0) {
      show('Please add at least one valid line item with product and quantity', 'error');
      return;
    }
    
    // Prepare clean line items matching purchase_order_lines schema
    const cleanLines = lines
      .filter(line => (line.product_id && String(line.product_id).trim() && (Number(line.qty) || 0) > 0))
      .map(line => ({
        product_id: Number(line.product_id),
        qty: Number(line.qty),
        unit_price: Number(line.unit_price) || 0,
        tax_percent: Number(line.tax_percent) || 0,
        total: Number(line.total) || 0
      }));

    if (cleanLines.length === 0) {
      show('No valid line items found.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Generate PO number if not provided
      const poNumber = form.po_number || `PO${String(Date.now()).slice(-6)}`;
      
      // Prepare order payload matching purchase_orders schema
      const orderPayload = {
        po_number: poNumber,
        vendor_id: Number(form.vendor_id),
        po_date: form.po_date,
        reference: form.reference || `REQ-${String(Date.now()).slice(-4)}`,
        status: form.status || 'Draft'
      };

      const createdOrder = await createPurchaseOrderWithLines(orderPayload, cleanLines);
      
      let successMessage = `Purchase Order #${createdOrder.id} created successfully!`;
      
      // Show additional message if bill was auto-generated
      if (orderPayload.status === 'Confirmed' || orderPayload.status === 'Converted') {
        successMessage += ' Vendor bill has been automatically generated.';
      }
      
      show(successMessage, 'success');
      setTimeout(() => navigate('/orders'), 2000);

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create Purchase Order';
      show(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">New Purchase Order</h1>
        <Card><div className="text-center py-8">Loading data...</div></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Purchase Order</h1>
          <p className="text-gray-600">Create a new purchase order for a vendor</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>

      <Card title="Purchase Order Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="PO Number"
            value={form.po_number}
            onChange={(e) => setForm(f => ({ ...f, po_number: e.target.value }))}
            placeholder="Auto-generated if empty"
          />
          <Select
            label="Vendor *"
            value={form.vendor_id}
            onChange={(e) => setForm(f => ({ ...f, vendor_id: e.target.value }))}
            options={[{ value: '', label: 'Select Vendor' }, ...vendors.map(v => ({ value: v.id, label: v.name }))]}
            required
          />
          <Input
            label="PO Date *"
            type="date"
            value={form.po_date}
            onChange={(e) => setForm(f => ({ ...f, po_date: e.target.value }))}
            required
          />
          <Input
            label="Reference"
            value={form.reference}
            onChange={(e) => setForm(f => ({ ...f, reference: e.target.value }))}
            placeholder="Reference number or code"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Converted', label: 'Converted' }
            ]}
          />
        </div>
      </Card>

      <Card title="Line Items">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">Valid line items: {validLinesCount} of {lines.length}</div>
          <Button type="button" onClick={addLine} disabled={!products.length} variant="outline">
            <span>➕</span> Add Line Item
          </Button>
        </div>

        <div className="space-y-4">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-4 bg-gray-50 rounded-lg border">
              <div className="md:col-span-2">
                <Select
                  label={`Product ${idx + 1} *`}
                  value={line.product_id}
                  onChange={(e) => {
                    const productId = e.target.value;
                    const product = productsById.get(String(productId));
                    const suggestedPrice = product?.purchase_price ?? product?.price ?? 0;
                    const suggestedTax = product?.tax_percent ?? 0;
                    updateLine(idx, {
                      product_id: productId,
                      unit_price: suggestedPrice,
                      tax_percent: suggestedTax,
                    });
                  }}
                  options={[{ value: '', label: 'Select Product' }, ...products.map(p => ({ value: p.id, label: `${p.name} (${p.sku || 'N/A'})` }))]}
                />
              </div>
              <Input
                label="Qty *"
                type="number" min="1" step="1"
                value={line.qty}
                onChange={(e) => updateLine(idx, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
              />
              <Input
                label="Unit Price"
                type="number" min="0" step="0.01"
                value={line.unit_price}
                onChange={(e) => updateLine(idx, { unit_price: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
              <Input
                label="Tax %"
                type="number" min="0" step="0.01"
                value={line.tax_percent}
                onChange={(e) => updateLine(idx, { tax_percent: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <div className="px-3 py-2 bg-gray-100 rounded border text-sm font-medium">
                  ₹{line.total.toFixed(2)}
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length <= 1}
                  variant="outline"
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Detailed Order Summary */}
      <Card title="Purchase Order Summary">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Order Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">PO Number:</span>
                <div className="font-medium">{form.po_number || 'Auto-generated'}</div>
              </div>
              <div>
                <span className="text-gray-600">PO Date:</span>
                <div className="font-medium">{form.po_date}</div>
              </div>
              <div>
                <span className="text-gray-600">Vendor:</span>
                <div className="font-medium">
                  {form.vendor_id ? vendors.find(v => v.id == form.vendor_id)?.name || 'Unknown' : 'Not selected'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Reference:</span>
                <div className="font-medium">{form.reference || 'Auto-generated'}</div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    form.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    form.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {form.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Line Items:</span>
                <div className="font-medium">{validLinesCount} items</div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tax:</span>
                <span className="font-medium">₹{totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Summary Table */}
        {validLinesCount > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Line Items Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Tax %</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lines.filter(line => line.product_id && line.qty > 0).map((line, idx) => {
                    const product = productsById.get(String(line.product_id));
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{product?.name || 'Unknown Product'}</div>
                          <div className="text-gray-500 text-xs">SKU: {product?.sku || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">{line.qty}</td>
                        <td className="px-4 py-3 text-sm text-right">₹{Number(line.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-center">{Number(line.tax_percent).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">₹{Number(line.total).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-4">
        <Button onClick={submit} disabled={!canSubmit}>
          {saving ? 'Creating...' : 'Create Purchase Order'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/orders')} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PurchaseOrderCreate;