// Utility helpers for Purchase Orders
import { purchaseOrdersAPI, vendorBillsAPI } from '../services/api';

// Calculate totals from line items
// lines: [{ quantity, price, tax_percent? }]
export function calculateOrderTotals(lines = [], defaultTaxPercent = 0) {
  const norm = (Number.isFinite(defaultTaxPercent) ? defaultTaxPercent : 0);
  const subtotal = lines.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.price) || 0;
    return sum + qty * price;
  }, 0);
  // If per-line tax_percent exists, use it; else use default
  const tax = lines.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.price) || 0;
    const lineTaxPct = (l.tax_percent == null ? norm : Number(l.tax_percent) || 0);
    return sum + (qty * price * lineTaxPct) / 100;
  }, 0);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

// Create PO with lines, returns created order { id, ... }
export async function createPurchaseOrderWithLines(order, lines) {
  console.log('=== Starting Purchase Order Creation ===');
  console.log('Order data:', JSON.stringify(order, null, 2));
  console.log('Lines data:', JSON.stringify(lines, null, 2));
  
  try {
    // Step 1: Create the purchase order
    console.log('Step 1: Creating purchase order...');
    
    // Clean the order data - remove any undefined/null values
    const cleanOrder = Object.keys(order).reduce((acc, key) => {
      if (order[key] !== null && order[key] !== undefined && order[key] !== '') {
        acc[key] = order[key];
      }
      return acc;
    }, {});
    
    console.log('Clean order data:', cleanOrder);
    
    const poResponse = await purchaseOrdersAPI.create(cleanOrder);
    console.log('Purchase order creation response:', poResponse);
    
    // Handle different response formats
    let createdOrder;
    if (poResponse.data) {
      createdOrder = Array.isArray(poResponse.data) ? poResponse.data[0] : poResponse.data;
    } else {
      createdOrder = poResponse;
    }
    
    console.log('Created order object:', createdOrder);
    
    if (!createdOrder || !createdOrder.id) {
      console.error('Invalid order creation response:', createdOrder);
      throw new Error('Purchase order creation failed - no valid order returned');
    }
    
    const orderId = createdOrder.id;
    console.log(`✅ Purchase order created successfully with ID: ${orderId}`);
    
    // Step 2: Create line items if any
    if (lines && lines.length > 0) {
      console.log(`Step 2: Creating ${lines.length} line items...`);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`Creating line item ${i + 1}/${lines.length}:`, line);
        
        // Clean line data
        const cleanLine = {
          purchase_order_id: orderId,
          product_id: Number(line.product_id),
          quantity: Number(line.quantity),
          price: Number(line.price) || 0,
          line_number: i + 1
        };
        
        console.log('Clean line data:', cleanLine);
        
        try {
          const lineResponse = await purchaseOrdersAPI.createLine(cleanLine);
          console.log(`✅ Line ${i + 1} created successfully:`, lineResponse.data);
        } catch (lineError) {
          console.error(`❌ Failed to create line ${i + 1}:`, lineError);
          console.error('Line error details:', {
            message: lineError.message,
            response: lineError.response?.data,
            status: lineError.response?.status
          });
          throw new Error(`Failed to create line item ${i + 1}: ${lineError.response?.data?.message || lineError.message}`);
        }
      }
      
      console.log('✅ All line items created successfully');
    } else {
      console.log('No line items to create');
    }
    
    console.log('=== Purchase Order Creation Completed Successfully ===');
    
    // Step 3: Auto-generate vendor bill if order status is 'Confirmed' or 'Converted'
    if (order.status === 'Confirmed' || order.status === 'Converted') {
      console.log('Step 3: Auto-generating vendor bill...');
      try {
        await generateVendorBillFromPO(createdOrder, lines);
        console.log('✅ Vendor bill generated successfully');
      } catch (billError) {
        console.error('❌ Failed to generate vendor bill:', billError);
        // Don't fail the entire process if bill generation fails
      }
    }
    
    return createdOrder;
    
  } catch (error) {
    console.error('=== Purchase Order Creation Failed ===');
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.response?.status === 400) {
      throw new Error(`Bad Request: ${error.response.data?.message || 'Invalid data provided'}`);
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized: Please check your authentication');
    } else if (error.response?.status === 403) {
      throw new Error('Forbidden: You do not have permission to create purchase orders');
    } else if (error.response?.status === 404) {
      throw new Error('Not Found: Purchase orders endpoint not available');
    } else if (error.response?.status >= 500) {
      throw new Error('Server Error: Please try again later');
    }
    
    throw error;
  }
}

// Fetch purchase orders with server-side filters
export async function getPurchaseOrders({ page = 1, pageSize = 10, status, vendorId, fromDate, toDate, sort = 'created_at.desc' } = {}) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const params = { order: sort };
  if (status) params['status'] = `eq.${status}`;
  if (vendorId) params['vendor_id'] = `eq.${vendorId}`;
  if (fromDate) params['created_at'] = `gte.${fromDate}`;
  // Note: For range date filters, you'd use two filters; PostgREST supports multiple params.
  // You can pass both gte and lte by calling with Includes or by splitting into two requests.
  if (toDate) params['created_at_lte'] = `lte.${toDate}`; // consumer should translate this if needed

  const res = await purchaseOrdersAPI.getAll(params, { Range: `${start}-${end}`, Prefer: 'count=exact' });
  const data = res.data || [];
  const cr = res.headers['content-range'] || res.headers['Content-Range'] || '*/0';
  const total = Number(cr.split('/')[1]) || 0;
  const filteredOrders = data.filter(order => order.status === 'Confirmed' || order.status === 'Converted');
  return { data: filteredOrders, count: filteredOrders.length };
}

// Generate vendor bill from purchase order
export async function generateVendorBillFromPO(purchaseOrder, orderLines) {
  console.log('=== Generating Vendor Bill from PO ===');
  console.log('PO Data:', purchaseOrder);
  console.log('Order Lines:', orderLines);

  try {
    // Calculate total amount from order lines
    const totalAmount = orderLines.reduce((sum, line) => {
      // Handle different line item structures
      if (line.total) {
        return sum + Number(line.total);
      } else if (line.quantity && line.price) {
        const lineSubtotal = Number(line.quantity) * Number(line.price);
        const taxAmount = lineSubtotal * (Number(line.tax_percent || 0) / 100);
        return sum + lineSubtotal + taxAmount;
      } else if (line.qty && line.unit_price) {
        const lineSubtotal = Number(line.qty) * Number(line.unit_price);
        const taxAmount = lineSubtotal * (Number(line.tax_percent || 0) / 100);
        return sum + lineSubtotal + taxAmount;
      }
      return sum;
    }, 0);

    // Generate bill number
    const billNumber = `BILL-${purchaseOrder.po_number || purchaseOrder.id}-${Date.now().toString().slice(-4)}`;

    // Prepare vendor bill data
    const billData = {
      bill_number: billNumber,
      vendor_id: purchaseOrder.vendor_id,
      purchase_order_id: purchaseOrder.id,
      bill_date: new Date().toISOString().slice(0, 10),
      due_date: null, // Can be set based on vendor payment terms
      amount: totalAmount,
      status: 'Unpaid',
      description: `Bill generated from Purchase Order ${purchaseOrder.po_number || purchaseOrder.id}`,
      created_at: new Date().toISOString()
    };

    console.log('Bill data to create:', billData);

    // Create the vendor bill
    const billResponse = await vendorBillsAPI.create(billData);
    console.log('Vendor bill created:', billResponse.data);

    return billResponse.data;

  } catch (error) {
    console.error('Error generating vendor bill:', error);
    throw new Error(`Failed to generate vendor bill: ${error.message}`);
  }
}
