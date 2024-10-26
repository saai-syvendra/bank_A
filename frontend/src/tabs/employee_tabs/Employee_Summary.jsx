import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, CreditCard, Landmark, PiggyBank } from "lucide-react"

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Branch Overview</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Accounts</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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
                {accountsData.map((account) => (
                  <TableRow key={account.accountNo}>
                    <TableCell>{account.accountNo}</TableCell>
                    <TableCell>{account.customerId}</TableCell>
                    <TableCell>{account.accountType}</TableCell>
                    <TableCell>{account.startingDate}</TableCell>
                    <TableCell>₹{account.balance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData.map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell>{customer.customerId}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.customerType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Loans</CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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
                {loansData.map((loan) => (
                  <TableRow key={loan.loanId}>
                    <TableCell>{loan.loanId}</TableCell>
                    <TableCell>{loan.loanType}</TableCell>
                    <TableCell>₹{loan.loanAmount.toFixed(2)}</TableCell>
                    <TableCell>{loan.startDate}</TableCell>
                    <TableCell>{loan.planName}</TableCell>
                    <TableCell>{loan.installmentsPaid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Fixed Deposits</CardTitle>
            <PiggyBank className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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
                {fdData.map((fd) => (
                  <TableRow key={fd.fdId}>
                    <TableCell>{fd.fdId}</TableCell>
                    <TableCell>{fd.connectedAccountNo}</TableCell>
                    <TableCell>{fd.startingDate}</TableCell>
                    <TableCell>₹{fd.amount.toFixed(2)}</TableCell>
                    <TableCell>{fd.planName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}