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
import ViewBranchTransactions from '../employee_tabs/ViewBranchTransactions';

const transactionTypes = ['all', 'credit', 'debit'];
const transactionMethods = ['all', 'atm-cdm', 'online-transfer', 'server', 'via_employee'];

const methodColors = {
  'atm-cdm': 'bg-green-500',
  'online-transfer': 'bg-blue-500',
  'server': 'bg-gray-500',
  'via_employee': 'bg-yellow-500'
};

export default function BranchTransactionsPage() {
  return (
    <div className="p-6">
      <ViewBranchTransactions />
      <Transactioncharts/>
    </div>
  );
}