import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VendorsList from './pages/Vendors/List';
import VendorForm from './pages/Vendors/Form';
import ProductsList from './pages/Products/List';
import ProductForm from './pages/Products/Form';
import PurchaseOrdersList from './pages/PurchaseOrders/List';
import PurchaseOrderCreate from './pages/PurchaseOrders/Create';
import VendorBillsList from './pages/VendorBills/List';
import VendorBillCreate from './pages/VendorBills/Create';
import PaymentsList from './pages/Payments/List';
import PaymentCreate from './pages/Payments/Create';
import Reports from './pages/Reports';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import UsersList from './pages/Users/List';
import UserForm from './pages/Users/Form';
import CreateUser from './pages/Users/Create';
import AdminSettings from './pages/Settings/Index';
import InventoryList from './pages/Inventory/List';
import SalesList from './pages/Sales/List';
import AccountsLedger from './pages/Accounts/Ledger';
import TrialBalance from './pages/Accounts/TrialBalance';
import AnalyticsDashboard from './pages/Analytics/Dashboard';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />

        <Route path="/users" element={<UsersList />} />
        <Route path="/users/new" element={<CreateUser />} />
        <Route path="/users/:id/edit" element={<UserForm />} />

        <Route path="/vendors" element={<VendorsList />} />
        <Route path="/vendors/new" element={<VendorForm />} />
        <Route path="/vendors/:id" element={<VendorForm />} />

        <Route path="/products" element={<ProductsList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductForm />} />

        <Route path="/orders" element={<PurchaseOrdersList />} />
        <Route path="/orders/new" element={<PurchaseOrderCreate />} />

        <Route path="/bills" element={<VendorBillsList />} />
        <Route path="/bills/new" element={<VendorBillCreate />} />

        <Route path="/payments" element={<PaymentsList />} />
        <Route path="/payments/new" element={<PaymentCreate />} />

        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<AdminSettings />} />
        
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/sales" element={<SalesList />} />
        <Route path="/accounts/ledger" element={<AccountsLedger />} />
        <Route path="/accounts/trial-balance" element={<TrialBalance />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
