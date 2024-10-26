'use client'

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Users, CreditCard, Landmark, PiggyBank, Search } from "lucide-react"

export default function BranchOverview() {
  // Dummy data
  const accountsData = [
    { accountNo: "A001", customerId: "C001", accountType: "Savings", startingDate: "2023-01-15", balance: 5000 },
    { accountNo: "A002", customerId: "C002", accountType: "Current", startingDate: "2023-02-20", balance: 10000 },
    { accountNo: "A003", customerId: "C003", accountType: "Savings", startingDate: "2023-03-10", balance: 7500 },
  ]

  const customersData = [
    { customerId: "C001", name: "John Doe", customerType: "Individual" },
    { customerId: "C002", name: "Jane Smith", customerType: "Business" },
    { customerId: "C003", name: "Bob Johnson", customerType: "Individual" },
  ]

  const loansData = [
    { loanId: "L001", loanType: "Personal", loanAmount: 50000, startDate: "2023-01-01", planName: "Personal 12", installmentsPaid: "2/12" },
    { loanId: "L002", loanType: "Home", loanAmount: 500000, startDate: "2023-02-15", planName: "Home 360", installmentsPaid: "3/360" },
    { loanId: "L003", loanType: "Car", loanAmount: 200000, startDate: "2023-03-20", planName: "Auto 48", installmentsPaid: "1/48" },
  ]

  const fdData = [
    { fdId: "FD001", connectedAccountNo: "A001", startingDate: "2023-01-20", amount: 10000, planName: "Fixed 1 Year" },
    { fdId: "FD002", connectedAccountNo: "A002", startingDate: "2023-02-25", amount: 50000, planName: "Fixed 3 Years" },
    { fdId: "FD003", connectedAccountNo: "A003", startingDate: "2023-03-15", amount: 25000, planName: "Fixed 6 Months" },
  ]

  const [accountSearch, setAccountSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [loanSearch, setLoanSearch] = useState("")
  const [fdSearch, setFdSearch] = useState("")

  const generateEmptyRows = (data, totalRows = 9) => {
    const emptyRows = totalRows - data.length;
    return emptyRows > 0 ? Array(emptyRows).fill({}) : [];
  };

  const filteredAccounts = accountsData.filter(account => 
    account.accountNo.toLowerCase().includes(accountSearch.toLowerCase()) ||
    account.customerId.toLowerCase().includes(accountSearch.toLowerCase())
  )

  const filteredCustomers = customersData.filter(customer => 
    customer.customerId.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const filteredLoans = loansData.filter(loan => 
    loan.loanId.toLowerCase().includes(loanSearch.toLowerCase())
  )

  const filteredFds = fdData.filter(fd => 
    fd.fdId.toLowerCase().includes(fdSearch.toLowerCase()) ||
    fd.connectedAccountNo.toLowerCase().includes(fdSearch.toLowerCase())
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Branch Overview</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Accounts</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by Account No or Customer ID"
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="h-[350px] overflow-y-auto">
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
                  {[...filteredAccounts, ...generateEmptyRows(filteredAccounts)].map((account, index) => (
                    <TableRow key={account.accountNo || `empty-${index}`} className={account.accountNo ? '' : 'border-none'}>
                      <TableCell>{account.accountNo || ''}</TableCell>
                      <TableCell>{account.customerId || ''}</TableCell>
                      <TableCell>{account.accountType || ''}</TableCell>
                      <TableCell>{account.startingDate || ''}</TableCell>
                      <TableCell>{account.balance ? `₹${account.balance.toFixed(2)}` : ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by Customer ID or Name"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="h-[350px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Customer Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredCustomers, ...generateEmptyRows(filteredCustomers)].map((customer, index) => (
                    <TableRow key={customer.customerId || `empty-${index}`} className={customer.customerId ? '' : 'border-none'}>
                      <TableCell>{customer.customerId || ''}</TableCell>
                      <TableCell>{customer.name || ''}</TableCell>
                      <TableCell>{customer.customerType || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Loans</CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by Loan ID"
                value={loanSearch}
                onChange={(e) => setLoanSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="h-[350px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Installments Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredLoans, ...generateEmptyRows(filteredLoans)].map((loan, index) => (
                    <TableRow key={loan.loanId || `empty-${index}`} className={loan.loanId ? '' : 'border-none'}>
                      <TableCell>{loan.loanId || ''}</TableCell>
                      <TableCell>{loan.loanType || ''}</TableCell>
                      <TableCell>{loan.loanAmount ? `₹${loan.loanAmount.toFixed(2)}` : ''}</TableCell>
                      <TableCell>{loan.startDate || ''}</TableCell>
                      <TableCell>{loan.planName || ''}</TableCell>
                      <TableCell>{loan.installmentsPaid || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Fixed Deposits</CardTitle>
            <PiggyBank className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by FD ID or Connected Account"
                value={fdSearch}
                onChange={(e) => setFdSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="h-[350px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FD ID</TableHead>
                    <TableHead>Connected Account</TableHead>
                    <TableHead>Starting Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredFds, ...generateEmptyRows(filteredFds)].map((fd, index) => (
                    <TableRow key={fd.fdId || `empty-${index}`} className={fd.fdId ? '' : 'border-none'}>
                      <TableCell>{fd.fdId || ''}</TableCell>
                      <TableCell>{fd.connectedAccountNo || ''}</TableCell>
                      <TableCell>{fd.startingDate || ''}</TableCell>
                      <TableCell>{fd.amount ? `₹${fd.amount.toFixed(2)}` : ''}</TableCell>
                      <TableCell>{fd.planName || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <style jsx global>{`
        .border-none td {
          border: none;
        }
      `}</style>
    </div>
  )
}