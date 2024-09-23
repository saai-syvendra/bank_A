import React, { useEffect, useState, useCallback } from "react";
import {
  callGetBranchAccounts,
  callGetBranchAccountTransactions,
} from "../../api/AccountApi";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ViewBranchTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const defaultFilters = {
    startDate: "",
    transactionType: "all",
    minAmount: "",
    maxAmount: "",
    method: "all",
    accountId: "",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const fetchTransactions = useCallback(async () => {
    const apiFilters = { ...filters };
    if (apiFilters.transactionType === "all") {
      apiFilters.transactionType = "";
    }
    if (apiFilters.method === "all") {
      apiFilters.method = "";
    }
    if (apiFilters.accountId === "all") {
      apiFilters.accountId = "";
    }
    try {
      setIsLoading(true);
      const fetchedTransactions =
        await callGetBranchAccountTransactions(apiFilters);
      const sortedTransactions = fetchedTransactions.sort((a, b) => {
        return new Date(b.trans_timestamp) - new Date(a.trans_timestamp);
      });
      console.log("Fetched Transactions", sortedTransactions);
      setTransactions(sortedTransactions);
    } catch (error) {
      setTransactions([]);
      toast.error(error.message || "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchAccountIds = async () => {
    try {
      const accounts = await callGetBranchAccounts();
      setAccounts(accounts);
      console.log("Fetched Accounts", accounts);
    } catch (error) {
      toast.error(error.message || "Failed to fetch accounts");
    }
  };

  useEffect(() => {
    fetchAccountIds();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const cancelFilters = () => {
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-2xl font-bold">Branch Transactions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            <Select
              value={tempFilters.transactionType}
              onValueChange={(value) =>
                handleFilterChange("transactionType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={tempFilters.method}
              onValueChange={(value) => handleFilterChange("method", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online-transfer">Online Transfer</SelectItem>
                <SelectItem value="atm-cdm">ATM/CDM</SelectItem>
                <SelectItem value="via_employee">Via Employee</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={tempFilters.accountId}
              onValueChange={(value) => handleFilterChange("accountId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Account ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {accounts.map((account) => (
                  <SelectItem
                    key={account.account_id}
                    value={account.account_id}
                  >
                    {account.account_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Start Date"
              value={tempFilters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Min Amount"
              value={tempFilters.minAmount}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Amount"
              value={tempFilters.maxAmount}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
            />
          </div>
          <div className="flex justify-start space-x-2 mt-4 pt-3">
            <Button variant="outline" onClick={cancelFilters}>
              Reset Filters
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
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
                <TableRow key={transaction.transaction_id}>
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
}
