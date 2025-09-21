# Business Management System (Frontend)

A comprehensive React + TailwindCSS frontend for a Business Management System backed by PostgreSQL exposed via PostgREST.

## 🚀 Features

### Core Modules
- **📊 Dashboard** - Overview with key metrics and quick actions
- **📈 Analytics** - Business performance insights and trends
- **📦 Inventory Management** - Product stock tracking with status indicators
- **💰 Sales Management** - Invoice creation and sales tracking
- **📋 Purchase Orders** - Create and manage purchase orders with line items
- **🧾 Vendor Bills** - Bill management and payment tracking
- **💳 Payments** - Payment processing and history
- **📚 Account Ledger** - Detailed account transactions
- **⚖️ Trial Balance** - Financial accuracy verification
- **🏢 Vendor Management** - Supplier information and relationships
- **🏷️ Product Management** - Product catalog with pricing
- **👥 User Management** - Role-based user administration (Admin only)
- **📄 Reports** - Comprehensive business reports
- **⚙️ Settings** - System configuration and HSN cache management

### UI/UX Features
- **🌓 Dark Mode** - Toggle between light and dark themes
- **📱 Responsive Design** - Mobile-first design with responsive layouts
- **🔐 Role-Based Access** - Different permissions for Admin, Sales, Accounts, Purchase roles
- **🔍 Search & Filtering** - Advanced search and filtering capabilities
- **📄 Pagination** - Server-side pagination for large datasets
- **🎨 Modern UI** - Beautiful gradients, shadows, and animations
- **📊 Data Visualization** - Charts and metrics with color-coded indicators
- **🔔 Toast Notifications** - Real-time feedback for user actions
- **⚡ Loading States** - Smooth loading indicators and empty states
- **📄 PDF Export** - Generate professional PDF reports for ledgers and trial balance

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: TailwindCSS with custom components
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context (Auth, Toast)
- **Backend Integration**: PostgREST with PostgreSQL
- **PDF Generation**: jsPDF with autoTable for professional reports
- **Build Tool**: Create React App

## 📋 Prerequisites

- Node.js 16+ 
- PostgREST API running locally (configurable via `.env`)
- PostgreSQL database with appropriate schema

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # .env file (already created)
   REACT_APP_API_BASE_URL=http://localhost:3000
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Login with demo credentials**
   - Username: `admin`
   - Password: `admin`
   - Role: `Admin` (select from dropdown)

## 🎯 **Role-Based Login & Redirection**

After successful login, users are automatically redirected to their role-specific dashboard:

- **Admin** → Main Dashboard (`/`) - Full system overview
- **Sales** → Sales Dashboard (`/sales`) - Sales-focused interface  
- **Accounts** → Accounts Ledger (`/accounts/ledger`) - Financial management
- **Purchase** → Purchase Orders (`/orders`) - Procurement interface

## 📄 **PDF Export Features**

The system includes comprehensive PDF generation capabilities for financial reports:

### **Account Ledger PDF Export**
- **Professional formatting** with company header and account details
- **Complete transaction history** with running balance calculations
- **Summary section** showing opening balance, total debits/credits, and closing balance
- **Date range filtering** - Export specific periods
- **Preview option** - View PDF before downloading
- **Auto-generated filename** - `Ledger_AccountName_FromDate_to_ToDate.pdf`

### **Trial Balance PDF Export**
- **Standard trial balance format** with debit and credit columns
- **Automatic totaling** with balance verification
- **As-on-date reporting** - Generate for specific dates
- **Professional layout** with proper accounting formatting
- **Auto-generated filename** - `Trial_Balance_Date.pdf`

### **How to Use PDF Export:**
1. Navigate to **Accounts → Ledger** or **Accounts → Trial Balance**
2. Select account and date range (for ledger) or as-on date (for trial balance)
3. Click **"Preview PDF"** to view in browser or **"Generate PDF"** to download
4. PDF will be automatically downloaded with descriptive filename

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Table.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── EmptyState.jsx
│   │   └── MobileMenu.jsx
│   └── layout/          # Layout components
│       ├── AppLayout.jsx
│       ├── Sidebar.jsx
│       └── Topbar.jsx
├── contexts/            # React contexts
│   ├── AuthContext.js
│   └── ToastContext.jsx
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── Analytics/
│   ├── Inventory/
│   ├── Sales/
│   ├── Accounts/
│   ├── Users/
│   ├── Vendors/
│   ├── Products/
│   ├── PurchaseOrders/
│   ├── VendorBills/
│   ├── Payments/
│   ├── Reports.jsx
│   └── Settings/
├── routes/             # Route protection
│   └── ProtectedRoute.jsx
├── services/           # API integration
│   └── api.js
└── utils/             # Utility functions
    └── orders.js
```

## 🔌 API Integration

### PostgREST Configuration
- **Base URL**: Configurable via `REACT_APP_API_BASE_URL`
- **Authentication**: Token-based with localStorage persistence
- **Headers**: `Prefer: return=representation` for write operations
- **Pagination**: Range headers (`Range: 0-9`) with count (`Prefer: count=exact`)
- **Filtering**: PostgREST query parameters (`name=ilike.*search*`)
- **Sorting**: Order parameters (`order=name.asc`)

### API Modules
- `authAPI` - Authentication and user management
- `usersAPI` - User CRUD operations
- `vendorsAPI` - Vendor management
- `productsAPI` - Product catalog
- `purchaseOrdersAPI` - Purchase order operations
- `vendorBillsAPI` - Bill management
- `paymentsAPI` - Payment processing
- `hsnAPI` - HSN code management
- `healthAPI` - System health checks

## 👥 User Roles & Permissions

| Module | Admin | Sales | Accounts | Purchase |
|--------|-------|-------|----------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ❌ |
| Inventory | ✅ | ✅ | ❌ | ✅ |
| Sales | ✅ | ✅ | ❌ | ❌ |
| Purchase Orders | ✅ | ❌ | ❌ | ✅ |
| Bills | ✅ | ❌ | ✅ | ✅ |
| Payments | ✅ | ❌ | ✅ | ❌ |
| Accounts | ✅ | ❌ | ✅ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Info**: Purple (#8B5CF6)

### Component Variants
- **Buttons**: Primary, Secondary, Success, Danger, Outline
- **Cards**: Default, with title/subtitle, gradient backgrounds
- **Status Badges**: Payment, Stock, General status indicators
- **Tables**: Responsive with alternating rows and hover effects

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style
- **Components**: Functional components with hooks
- **Styling**: TailwindCSS utility classes
- **State**: React Context for global state
- **API**: Axios with interceptors and error handling
- **Routing**: React Router with protected routes

## 📱 Mobile Responsiveness

- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Mobile Menu**: Collapsible sidebar for mobile devices
- **Responsive Tables**: Horizontal scroll on smaller screens
- **Touch-Friendly**: Larger touch targets and spacing
- **Adaptive Layout**: Grid systems that adapt to screen size

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred hosting**
   - Netlify, Vercel, AWS S3, etc.
   - Ensure environment variables are configured

3. **Configure API endpoint**
   - Update `REACT_APP_API_BASE_URL` for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
