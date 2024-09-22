import React, { useEffect, useState, useCallback } from "react";
import TransactionCard from "../../components/TransactionCard";
import { callGetCustomerAccountTransactions } from "../../api/AccountApi";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const ViewTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedTransactions = await callGetCustomerAccountTransactions();
      console.log("Fetched Transactions", fetchedTransactions);
      setTransactions(fetchedTransactions);
    } catch (error) {
      toast.error(error.message || "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (transactions.length === 0) {
    return <div>No transactions found.</div>;
  }

  return (
    <div className="p-6">
      <Tabs defaultValue={transactions[0][0].account_number}>
        <TabsList>
          {transactions.map((accountTransactions, index) => (
            <TabsTrigger
              key={index}
              value={accountTransactions[0].account_number}
            >
              {accountTransactions[0].account_number}
            </TabsTrigger>
          ))}
        </TabsList>

        {transactions.map((accountTransactions, index) => (
          <TabsContent
            key={index}
            value={accountTransactions[0].account_number}
          >
            {/* {accountTransactions.map((transaction) => (
              <TransactionCard
                transaction={transaction}
                key={transaction.transaction_id}
              />
            ))} */}
            <Card className="mb-4">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID.</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountTransactions.map((transaction) => (
                      <TableRow>
                        <TableCell>{transaction.transaction_id}</TableCell>
                        <TableCell
                          className={`text-gray-800 font-semibold ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.transaction_type === "debit" ? "-" : ""}{" "}
                          Rs. {parseFloat(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.date), "PP")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.date), "p")}
                        </TableCell>
                        <TableCell>{transaction.reason}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              transaction.method === "online-transfer"
                                ? "bg-blue-500"
                                : transaction.method === "atm-cdm"
                                  ? "bg-green-500"
                                  : transaction.method === "via_employee"
                                    ? "bg-yellow-500"
                                    : "bg-gray-500"
                            }`}
                          >
                            {transaction.method}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ViewTransactions;
/*


*/
