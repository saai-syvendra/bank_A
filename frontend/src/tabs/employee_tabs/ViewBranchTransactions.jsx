import React, { useEffect, useState, useCallback } from "react";
import { callGetBranchAccountTransactions } from "../../api/AccountApi";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const ViewBranchTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedTransactions = await callGetBranchAccountTransactions();
      const sortedTransactions = fetchedTransactions.sort((a, b) => {
        return new Date(b.trans_timestamp) - new Date(a.trans_timestamp);
      });
      console.log("Fetched Transactions", sortedTransactions);
      setTransactions(sortedTransactions);
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
      <Card className="mb-4">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID.</TableHead>
                <TableHead>Account No</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow>
                  <TableCell>{transaction.transaction_id}</TableCell>
                  <TableCell>{transaction.account_number}</TableCell>
                  <TableCell
                    className={`text-gray-800 font-semibold ${
                      transaction.trans_type === "debit"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {transaction.trans_type === "debit" ? "-" : ""} Rs.{" "}
                    {parseFloat(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.trans_timestamp), "PP")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.trans_timestamp), "p")}
                  </TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        transaction.trans_method === "online-transfer"
                          ? "bg-blue-500"
                          : transaction.trans_method === "atm-cdm"
                            ? "bg-green-500"
                            : transaction.trans_method === "via_employee"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                      }`}
                    >
                      {transaction.trans_method}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewBranchTransactions;
