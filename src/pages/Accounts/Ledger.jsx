import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { generateLedgerPDF, downloadPDF, previewPDF } from '../../utils/pdfGenerator';
import { useToast } from '../../contexts/ToastContext';

const AccountsLedger = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0,10));
  const [balance, setBalance] = useState({ opening: 0, closing: 0, debit: 0, credit: 0 });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { show } = useToast();

  // Mock accounts data
  const accounts = [
    { value: 'cash', label: 'Cash Account' },
    { value: 'bank', label: 'Bank Account' },
    { value: 'sales', label: 'Sales Account' },
    { value: 'purchase', label: 'Purchase Account' },
    { value: 'expenses', label: 'Expenses Account' },
  ];

  // Mock ledger data
  useEffect(() => {
    if (selectedAccount) {
      const mockData = [
        { id: 1, date: '2024-01-15', particulars: 'Sales Invoice #001', voucher_no: 'V001', debit: 15000, credit: 0 },
        { id: 2, date: '2024-01-16', particulars: 'Purchase Bill #002', voucher_no: 'V002', debit: 0, credit: 8500 },
        { id: 3, date: '2024-01-17', particulars: 'Cash Payment', voucher_no: 'V003', debit: 0, credit: 5000 },
        { id: 4, date: '2024-01-18', particulars: 'Sales Return', voucher_no: 'V004', debit: 0, credit: 2000 },
      ];
      setLedgerData(mockData);
      
      const totalDebit = mockData.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = mockData.reduce((sum, item) => sum + item.credit, 0);
      setBalance({
        opening: 5000,
        debit: totalDebit,
        credit: totalCredit,
        closing: 5000 + totalDebit - totalCredit
      });
    }
  }, [selectedAccount, fromDate, toDate]);

  const columns = [
    { key: 'date', title: 'Date' },
    { key: 'particulars', title: 'Particulars' },
    { key: 'voucher_no', title: 'Voucher No.' },
    { 
      key: 'debit', 
      title: 'Debit',
      render: (value) => value ? `₹${value.toLocaleString()}` : '-'
    },
    { 
      key: 'credit', 
      title: 'Credit',
      render: (value) => value ? `₹${value.toLocaleString()}` : '-'
    },
  ];

  const generateLedger = () => {
    // This would typically make an API call
    console.log('Generating ledger for:', { selectedAccount, fromDate, toDate });
  };

  const generatePDF = async (action = 'download') => {
    if (!selectedAccount) {
      show('Please select an account first', 'error');
      return;
    }

    if (!ledgerData.length) {
      show('No ledger data available to generate PDF', 'error');
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const accountInfo = accounts.find(acc => acc.value === selectedAccount);
      const dateRange = { from: fromDate, to: toDate };
      
      const doc = generateLedgerPDF(ledgerData, accountInfo, balance, dateRange);
      
      if (action === 'preview') {
        previewPDF(doc);
        show('PDF preview opened in new tab', 'success');
      } else {
        const filename = `Ledger_${accountInfo.label.replace(/\s+/g, '_')}_${fromDate}_to_${toDate}.pdf`;
        downloadPDF(doc, filename);
        show('PDF downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      show('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Ledger</h1>
          <p className="text-gray-600 dark:text-gray-400">View detailed account transactions and balances</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select
            label="Select Account"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            options={[{ value: '', label: 'Choose Account' }, ...accounts]}
          />
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
          <div className="flex items-end">
            <Button onClick={generateLedger} className="w-full">
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {selectedAccount && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="text-center">
                <p className="text-blue-100">Opening Balance</p>
                <p className="text-2xl font-bold">₹{balance.opening.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="text-center">
                <p className="text-green-100">Total Debit</p>
                <p className="text-2xl font-bold">₹{balance.debit.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="text-center">
                <p className="text-red-100">Total Credit</p>
                <p className="text-2xl font-bold">₹{balance.credit.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="text-center">
                <p className="text-purple-100">Closing Balance</p>
                <p className="text-2xl font-bold">₹{balance.closing.toLocaleString()}</p>
              </div>
            </Card>
          </div>

          <Card title={`Ledger - ${accounts.find(a => a.value === selectedAccount)?.label}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {ledgerData.length} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => generatePDF('preview')}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2"
                >
                  <span>👁️</span>
                  {isGeneratingPDF ? 'Generating...' : 'Preview PDF'}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => generatePDF('download')}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2"
                >
                  <span>📄</span>
                  {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
                </Button>
              </div>
            </div>
            <Table columns={columns} data={ledgerData} />
            
            <div className="mt-6 pt-4 border-t bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Debit</p>
                  <p className="text-lg font-bold text-green-600">₹{balance.debit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Credit</p>
                  <p className="text-lg font-bold text-red-600">₹{balance.credit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Net Balance</p>
                  <p className={`text-lg font-bold ${balance.closing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Math.abs(balance.closing).toLocaleString()} {balance.closing >= 0 ? 'Dr' : 'Cr'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountsLedger;
