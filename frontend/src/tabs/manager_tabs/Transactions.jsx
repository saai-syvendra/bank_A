import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { callGetFilteredTransReports } from '../../api/TransactionApi'; 
import Transactioncharts from "./Transactioncharts";
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const transactionTypes = ['all', 'credit', 'debit'];
const transactionMethods = ['all', 'atm-cdm', 'online-transfer', 'server', 'via_employee'];

const methodColors = {
  'atm-cdm': 'bg-green-500',
  'online-transfer': 'bg-blue-500',
  'server': 'bg-gray-500',
  'via_employee': 'bg-yellow-500'
};

export default function BranchTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [transactionMethod, setTransactionMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const filters = {
        start__date: startDate || null,
        end__date: endDate || null,
        max__amount: maxAmount || null,
        min__amount: minAmount || null,
        transaction__type: transactionType !== 'all' ? transactionType : null,
        transaction__method: transactionMethod !== 'all' ? transactionMethod : null,
      };
      console.log("Filters:", filters);  

      const data = await callGetFilteredTransReports(filters);
      setTransactions(data); 
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, minAmount, maxAmount, transactionType, transactionMethod]);

  const resetFilters = () => {
    setMinAmount('');
    setMaxAmount('');
    setTransactionType('all');
    setTransactionMethod('all');
    setStartDate('');
    setEndDate('');
  };

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...transactions].sort((a, b) => {
      if (key === 'amount') {
        return direction === 'ascending' 
          ? parseFloat(a.amount) - parseFloat(b.amount)
          : parseFloat(b.amount) - parseFloat(a.amount);
      }
      if (key === 'trans_timestamp') {
        return direction === 'ascending'
          ? new Date(a.trans_timestamp) - new Date(b.trans_timestamp)
          : new Date(b.trans_timestamp) - new Date(a.trans_timestamp);
      }
      return 0;
    });

    setTransactions(sortedData);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') return <ChevronUp className="inline-block ml-1 size-4" />
      if (sortConfig.direction === 'descending') return <ChevronDown className="inline-block ml-1 size-4" />
    }
    return <ChevronsUpDown className="inline-block ml-1 size-4" />
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Branch Transactions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        <div>
          <Label htmlFor="minAmount">Min Amount</Label>
          <Input
            id="minAmount"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="Min Amount"
          />
        </div>
        
        <div>
          <Label htmlFor="maxAmount">Max Amount</Label>
          <Input
            id="maxAmount"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="Max Amount"
          />
        </div>
        
        <div>
          <Label htmlFor="transactionType">Transaction Type</Label>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger id="transactionType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="transactionMethod">Transaction Method</Label>
          <Select value={transactionMethod} onValueChange={setTransactionMethod}>
            <SelectTrigger id="transactionMethod">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {transactionMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <div className="flex items-end">
          <Button onClick={resetFilters} className="w-full">
            Reset Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortData('amount')}
                >
                  Amount {getSortIcon('amount')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => sortData('trans_timestamp')}
                >
                  Date {getSortIcon('trans_timestamp')}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell className={transaction.trans_type === 'credit' ? 'text-red-600' : 'text-green-600'}>
                    {transaction.trans_type === 'credit' ? '-' : ''}
                    Rs.{parseFloat(transaction.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>{format(new Date(transaction.trans_timestamp), 'PP')}</TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${
                      methodColors[transaction.trans_method] || 'bg-gray-500'
                    }`}>
                      {transaction.trans_method.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Transactioncharts/>
        </div>
      )}
      
      {transactions.length === 0 && !loading && (
        <p className="text-center mt-4 text-gray-500">No transactions found matching the current filters.</p>
      )}
    </div>
  );
}