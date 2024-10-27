'use client'

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Users, CreditCard, Landmark, PiggyBank, Search } from "lucide-react"
import { callGetBranchLoanSummary } from "../../api/LoanApi"
import { toast } from "sonner"
import { callGetBranchCustomers } from "../../api/AccountApi"
import { callGetBranchFdSummary } from "../../api/FdApi"
import { callGetthisBranchCustomers } from "../../api/CustomerApi"

export default function BranchOverview() {
  const [loansData, setLoans] = useState([])
  const [accountsData, setAccounts] = useState([])
  const [fdData, setfds] = useState([])
  const [customersData, setcustomers] = useState([])
  const [accountSearch, setAccountSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [loanSearch, setLoanSearch] = useState("")
  const [fdSearch, setFdSearch] = useState("")

  const fetchLoans = async () => {
    try {
      const data = await callGetBranchLoanSummary()
      setLoans(data)
    } catch (error) {
      toast.error(error.message || "Failed to fetch loans")
    }
  }

  const fetchAccounts = async () => {
    try {
      const data = await callGetBranchCustomers()
      setAccounts(data)
    } catch (error) {
      toast.error(error.message || "Failed to fetch accounts")
    }
  }

  const fetchFds = async () => {
    try {
      const data = await callGetBranchFdSummary()
      setfds(data)
    } catch (error) {
      toast.error(error.message || "Failed to fetch FDs")
    }
  }

  const fetchCustomers = async () => {
    try {
      const data = await callGetthisBranchCustomers()
      setcustomers(data)
    } catch (error) {
      toast.error(error.message || "Failed to fetch customers")
    }
  }

  useEffect(() => {
    fetchLoans()
    fetchAccounts()
    fetchFds()
    fetchCustomers()
  }, [])

  const generateEmptyRows = (data, totalRows = 9) => {
    const emptyRows = totalRows - data.length
    return emptyRows > 0 ? Array(emptyRows).fill({}) : []
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const filteredAccounts = accountsData.filter(account => 
    account.account_number.toString().toLowerCase().includes(accountSearch.toLowerCase()) ||
    account.customer_id.toString().toLowerCase().includes(accountSearch.toLowerCase())
  )

  const filteredCustomers = customersData.filter(customer => 
    customer.customer_id.toString().toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.first_name.toString().toLowerCase().includes(customerSearch.toLowerCase())
  )

  const filteredLoans = loansData.filter(loan => 
    loan.loan_id.toString().toLowerCase().includes(loanSearch.toLowerCase()) ||
    loan.customer_id.toString().toLowerCase().includes(loanSearch.toLowerCase())
  )

  const filteredFds = fdData.filter(fd => 
    fd.id.toString().toLowerCase().includes(fdSearch.toLowerCase()) ||
    fd.account_number.toString().toLowerCase().includes(fdSearch.toLowerCase())
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
                    <TableRow key={account.account_number || `empty-${index}`} className={`h-10 ${account.account_number ? 'border-b' : 'border-b-0'}`}>
                      <TableCell>{account.account_number || ''}</TableCell>
                      <TableCell>{account.customer_id || ''}</TableCell>
                      <TableCell>{account.account_type || ''}</TableCell>
                      <TableCell>{account.starting_date ? formatDate(account.starting_date) : ''}</TableCell>
                      <TableCell>{account.balance && !isNaN(account.balance) ? `Rs.${Number(account.balance).toFixed(2)}` : ''}</TableCell>
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
                    <TableRow key={customer.customer_id || `empty-${index}`} className={`h-10 ${customer.customer_id ? 'border-b' : 'border-b-0'}`}>
                      <TableCell>{customer.customer_id || ''}</TableCell>
                      <TableCell>{customer.first_name || customer.name || ''}</TableCell>
                      <TableCell>{customer.c_type || ''}</TableCell>
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
                placeholder="Search by Loan ID or Customer ID"
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
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Installments Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredLoans, ...generateEmptyRows(filteredLoans)].map((loan, index) => (
                    <TableRow key={loan.loan_id || `empty-${index}`} className={`h-10 ${loan.loan_id ? 'border-b' : 'border-b-0'}`}>
                      <TableCell>{loan.loan_id || ''}</TableCell>
                      <TableCell>{loan.customer_id || ''}</TableCell>
                      <TableCell>{loan.loan_amount && !isNaN(loan.loan_amount) ? `Rs.${Number(loan.loan_amount).toFixed(2)}` : ''}</TableCell>
                      <TableCell>{loan.start_date ? formatDate(loan.start_date) : ''}</TableCell>
                      <TableCell>{loan.name || ''}</TableCell>
                      <TableCell>{loan.paid_installments || ''}</TableCell>
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
                placeholder="Search by FD ID or Account No"
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
                    <TableHead>Connected Account No</TableHead>
                    <TableHead>Starting Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredFds, ...generateEmptyRows(filteredFds)].map((fd, index) => (
                    <TableRow key={fd.id || `empty-${index}`} className={`h-10 ${fd.id ? 'border-b' : 'border-b-0'}`}>
                      <TableCell>{fd.id || ''}</TableCell>
                      <TableCell>{fd.account_number || ''}</TableCell>
                      <TableCell>{fd.starting_date ? formatDate(fd.starting_date) : ''}</TableCell>
                      <TableCell>{fd.amount && !isNaN(fd.amount) ? `Rs.${Number(fd.amount).toFixed(2)}` : ''}</TableCell>
                      <TableCell>{fd.name || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}