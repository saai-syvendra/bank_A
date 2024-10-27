import React, { useEffect, useState } from "react";
import { callGetThisCustomerAccounts } from "./../../api/AccountApi";
import { callGetLoansByAccountId } from "./../../api/LoanApi";
import { callGetFixedDepositsByAccountId } from "./../../api/FdApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown } from "lucide-react";

export default function Summary() {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer accounts
        const accounts = await callGetThisCustomerAccounts();

        // Fetch loans and fixed deposits for each account
        const loanPromises = accounts.map((account) =>
          callGetLoansByAccountId(account.account_id)
        );
        const fdPromises = accounts.map((account) =>
          callGetFixedDepositsByAccountId(account.account_id)
        );

        const loansData = await Promise.all(loanPromises);
        const fdsData = await Promise.all(fdPromises);
        // console.log(loansData);
        // console.log(fdsData);

        // Combine loans and fixed deposits with respective accounts
        const combinedAccounts = accounts.map((account, index) => ({
          ...account,
          loans: loansData[index] || [],
          fixedDeposits: fdsData[index] || [],
        }));

        // console.log(combinedAccounts);

        setCustomerData({
          accounts: combinedAccounts,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customerData) {
    return <p>No data available</p>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {customerData.accounts.map((account) => (
        <Card key={account.id} className="w-full">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-semibold">
                  {account.account_type.charAt(0).toUpperCase() +
                    account.account_type.slice(1)}{" "}
                  Account
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Account Number: {account.account_number}
                </CardDescription>
              </div>
              <div className="text-right">
                <CardDescription className="text-sm font-medium text-teal-600">
                  Current Balance
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-primary text-blue-900">
                  Rs.
                  {!isNaN(account.balance)
                    ? Number(account.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Collapsible>
              <CollapsibleTrigger className="bg-blue-100 flex items-center justify-between w-full p-2 bg-muted rounded-md">
                <span className="font-semibold">Loans</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {account.loans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Loan Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Approved Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.loans.map((loan) => (
                        <TableRow key={loan.loan_id}>
                          <TableCell>{loan.id}</TableCell>
                          <TableCell>{loan.name}</TableCell>
                          <TableCell>
                            {loan.loan_type.charAt(0).toUpperCase() +
                              loan.loan_type.slice(1)}{" "}
                            {loan.loan_type === "online"
                              ? ` (FD ID: ${loan.fd_id})`
                              : ""}
                          </TableCell>
                          <TableCell>
                            Rs.{" "}
                            {Number(loan.loan_amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>{loan.interest}%</TableCell>
                          <TableCell>
                            {new Date(loan.start_date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    No loans associated with this account.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="bg-blue-100 flex items-center justify-between w-full p-2 bg-muted rounded-md">
                <span className="font-semibold">Fixed Deposits</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {account.fixedDeposits.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>FD ID</TableHead>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Maturity Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.fixedDeposits.map((fd) => (
                        <TableRow key={fd.id}>
                          <TableCell>{fd.id}</TableCell>
                          <TableCell>{fd.name}</TableCell>
                          <TableCell>
                            Rs.{" "}
                            {Number(fd.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>{fd.interest}%</TableCell>
                          <TableCell>
                            {new Date(fd.maturity_date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    No fixed deposits associated with this account.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
