"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, CreditCard, Landmark, PiggyBank, Search } from "lucide-react";
import { callGetBranchLoanSummary } from "../../api/LoanApi";
import { toast } from "sonner";
import { callGetBranchCustomers } from "../../api/AccountApi";
import { callGetBranchFdSummary } from "../../api/FdApi";
import { callGetthisBranchCustomers } from "../../api/CustomerApi";

export default function BranchOverview() {
  const [loansData, setLoans] = useState([]);
  const [accountsData, setAccounts] = useState([]);
  const [fdData, setfds] = useState([]);
  const [customersData, setcustomers] = useState([]);
  const [accountSearch, setAccountSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [loanSearch, setLoanSearch] = useState("");
  const [fdSearch, setFdSearch] = useState("");

  const fetchLoans = async () => {
    try {
      const data = await callGetBranchLoanSummary();
      console.log("Loan", data);
      setLoans(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch loans");
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await callGetBranchCustomers();
      setAccounts(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch accounts");
    }
  };

  const fetchFds = async () => {
    try {
      const data = await callGetBranchFdSummary();
      setfds(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch FDs");
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await callGetthisBranchCustomers();
      console.log("Customer", data);
      setcustomers(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchAccounts();
    fetchFds();
    fetchCustomers();
  }, []);

  // const generateEmptyRows = (data, totalRows = 9) => {
  //   const emptyRows = totalRows - data.length
  //   return emptyRows > 0 ? Array(emptyRows).fill({}) : []
  // }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs.${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredAccounts = accountsData.filter(
    (account) =>
      account.account_number
        .toString()
        .toLowerCase()
        .includes(accountSearch.toLowerCase()) ||
      account.customer_id
        .toString()
        .toLowerCase()
        .includes(accountSearch.toLowerCase())
  );

  const filteredCustomers = customersData.filter(
    (customer) =>
      customer.customer_id
        .toString()
        .toLowerCase()
        .includes(customerSearch.toLowerCase()) ||
      customer.name
        .toString()
        .toLowerCase()
        .includes(customerSearch.toLowerCase())
  );

  const filteredLoans = loansData.filter(
    (loan) =>
      loan.loan_id
        .toString()
        .toLowerCase()
        .includes(loanSearch.toLowerCase()) ||
      loan.customer_id
        .toString()
        .toLowerCase()
        .includes(loanSearch.toLowerCase())
  );

  const filteredFds = fdData.filter(
    (fd) =>
      fd.id.toString().toLowerCase().includes(fdSearch.toLowerCase()) ||
      fd.account_number
        .toString()
        .toLowerCase()
        .includes(fdSearch.toLowerCase())
  );

  return (
    <div className="container mx-4 p-4 space-y-6">
      <Card className="mb-4 h-[375px] flex flex-col">
        <CardHeader className="flex flex-col shadow-md">
          <div className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-blue-900">
              Customers
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Customer ID or Name"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-auto flex-grow relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Customer Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => (
                <TableRow key={customer.customer_id} className="h-10 border-b">
                  <TableCell>{customer.customer_id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.c_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-4 h-[400px] flex flex-col">
        <CardHeader className="flex flex-col shadow-md">
          <div className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-blue-900">
              Accounts
            </CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Account No or Customer ID"
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-auto flex-grow relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account No</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Starting Date</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow
                  key={account.account_number}
                  className="h-10 border-b"
                >
                  <TableCell>{account.account_number}</TableCell>
                  <TableCell>{account.customer_id}</TableCell>
                  <TableCell>{account.account_type}</TableCell>
                  <TableCell>{formatDate(account.starting_date)}</TableCell>
                  <TableCell>{formatCurrency(account.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-4 h-[400px] flex flex-col">
        <CardHeader className="flex flex-col shadow-md">
          <div className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-blue-900">
              Loans
            </CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Loan ID or Customer ID"
              value={loanSearch}
              onChange={(e) => setLoanSearch(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-auto flex-grow relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Installments Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.loan_id} className="h-10 border-b">
                  <TableCell>{loan.loan_id}</TableCell>
                  <TableCell>{loan.customer_id}</TableCell>
                  <TableCell>{formatCurrency(loan.loan_amount)}</TableCell>
                  <TableCell>{formatDate(loan.start_date)}</TableCell>
                  <TableCell>{loan.name}</TableCell>
                  <TableCell>{loan.paid_installments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-4 h-[400px] flex flex-col">
        <CardHeader className="flex flex-col shadow-md">
          <div className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-blue-900">
              Fixed Deposits
            </CardTitle>
            <PiggyBank className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by FD ID or Account No"
              value={fdSearch}
              onChange={(e) => setFdSearch(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-auto flex-grow relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>FD ID</TableHead>
                <TableHead>Connected Account No</TableHead>
                <TableHead>Starting Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Plan Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFds.map((fd, index) => (
                <TableRow key={fd.id} className="h-10 border-b">
                  <TableCell>{fd.id}</TableCell>
                  <TableCell>{fd.account_number}</TableCell>
                  <TableCell>{formatDate(fd.starting_date)}</TableCell>
                  <TableCell>{formatCurrency(fd.amount)}</TableCell>
                  <TableCell>{fd.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}