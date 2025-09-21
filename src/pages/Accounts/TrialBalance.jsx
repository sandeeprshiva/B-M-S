import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { generateTrialBalancePDF, downloadPDF, previewPDF } from '../../utils/pdfGenerator';
import { useToast } from '../../contexts/ToastContext';

const TrialBalance = () => {
  const [trialBalanceData, setTrialBalanceData] = useState([]);
  const [asOnDate, setAsOnDate] = useState(() => new Date().toISOString().slice(0,10));
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { show } = useToast();

  // Mock trial balance data
  useEffect(() => {
    const mockData = [
      { id: 1, account_name: 'Cash Account', debit: 50000, credit: 0 },
      { id: 2, account_name: 'Bank Account', debit: 125000, credit: 0 },
      { id: 3, account_name: 'Sales Account', debit: 0, credit: 280000 },
      { id: 4, account_name: 'Purchase Account', debit: 180000, credit: 0 },
      { id: 5, account_name: 'Rent Expense', debit: 24000, credit: 0 },
      { id: 6, account_name: 'Salary Expense', debit: 60000, credit: 0 },
      { id: 7, account_name: 'Accounts Receivable', debit: 45000, credit: 0 },
      { id: 8, account_name: 'Accounts Payable', debit: 0, credit: 35000 },
      { id: 9, account_name: 'Capital Account', debit: 0, credit: 169000 },
    ];
    
    setTrialBalanceData(mockData);
    
    const totalDebit = mockData.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = mockData.reduce((sum, item) => sum + item.credit, 0);
    setTotals({ debit: totalDebit, credit: totalCredit });
  }, [asOnDate]);

  const columns = [
    { key: 'account_name', title: 'Account Name' },
    { 
      key: 'debit', 
      title: 'Debit Amount',
      render: (value) => value ? `₹${value.toLocaleString()}` : '-'
    },
    { 
      key: 'credit', 
      title: 'Credit Amount',
      render: (value) => value ? `₹${value.toLocaleString()}` : '-'
    },
  ];

  const generateReport = () => {
    console.log('Generating trial balance for date:', asOnDate);
  };

  const generatePDF = async (action = 'download') => {
    if (!trialBalanceData.length) {
      show('No trial balance data available to generate PDF', 'error');
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const dateRange = { to: asOnDate };
      const pdfData = trialBalanceData.map(item => ({
        account: item.account_name,
        debit: item.debit,
        credit: item.credit
      }));
      
      const doc = generateTrialBalancePDF(pdfData, dateRange);
      
      if (action === 'preview') {
        previewPDF(doc);
        show('PDF preview opened in new tab', 'success');
      } else {
        const filename = `Trial_Balance_${asOnDate}.pdf`;
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

  const isBalanced = totals.debit === totals.credit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trial Balance</h1>
          <p className="text-gray-600 dark:text-gray-400">Verify the mathematical accuracy of your books</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            label="As On Date"
            type="date"
            value={asOnDate}
            onChange={(e) => setAsOnDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={generateReport} className="w-full">
              Generate Report
            </Button>
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={() => generatePDF('preview')}
              disabled={isGeneratingPDF}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <span>👁️</span>
              {isGeneratingPDF ? 'Generating...' : 'Preview PDF'}
            </Button>
            <Button
              variant="primary"
              onClick={() => generatePDF('download')}
              disabled={isGeneratingPDF}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <span>📄</span>
              {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100">Total Debit</p>
            <p className="text-2xl font-bold">₹{totals.debit.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100">Total Credit</p>
            <p className="text-2xl font-bold">₹{totals.credit.toLocaleString()}</p>
          </div>
        </Card>
        <Card className={`bg-gradient-to-r ${isBalanced ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white`}>
          <div className="text-center">
            <p className={isBalanced ? 'text-green-100' : 'text-red-100'}>Status</p>
            <p className="text-xl font-bold">{isBalanced ? '✅ Balanced' : '❌ Not Balanced'}</p>
          </div>
        </Card>
      </div>

      <Card title={`Trial Balance as on ${new Date(asOnDate).toLocaleDateString()}`}>
        <Table columns={columns} data={trialBalanceData} />
        
        <div className="mt-6 pt-4 border-t bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Debit</p>
              <p className="text-2xl font-bold text-blue-600">₹{totals.debit.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Credit</p>
              <p className="text-2xl font-bold text-green-600">₹{totals.credit.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-t">
            <p className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {isBalanced ? 'Books are Balanced ✅' : `Difference: ₹${Math.abs(totals.debit - totals.credit).toLocaleString()} ❌`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrialBalance;
