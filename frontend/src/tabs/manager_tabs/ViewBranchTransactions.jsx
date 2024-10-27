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
import { DatePicker } from "@/components/ui/custom-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Transactioncharts from "./Transactioncharts";
import TotalTransactionAmountChart from "./Totaltransactionchart";

export default function ViewBranchTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const defaultFilters = {
    startDate: "",
    transactionType: "all",
    minAmount: "",
    maxAmount: "",
    method: "all",
    accountId: "all",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

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
    if (apiFilters.startDate !== "") {
      apiFilters.startDate = new Date(apiFilters.startDate)
        .toISOString()
        .split("T")[0]; // Convert Date to YYYY-MM-DD
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
      setOriginalTransactions(sortedTransactions);
    } catch (error) {
      setTransactions([]);
      setOriginalTransactions([]);
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
    setSortConfig({ key: null, direction: 'original' });
  };

  const cancelFilters = () => {
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    setSortConfig({key: null, direction: "ascending"});
  };

  const sortData = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = "original";
      }
    }
    setSortConfig({ key, direction });

    let sortedData;
    if (direction === "original") {
      sortedData = [...originalTransactions];
    } else {
      sortedData = [...originalTransactions].sort((a, b) => {
        if (key === "amount") {
          return direction === "ascending"
            ? parseFloat(a.amount) - parseFloat(b.amount)
            : parseFloat(b.amount) - parseFloat(a.amount);
        }
        if (key === "trans_timestamp") {
          return direction === "ascending"
            ? new Date(a.trans_timestamp) - new Date(b.trans_timestamp)
            : new Date(b.trans_timestamp) - new Date(a.trans_timestamp);
        }
        return 0;
      });
    }

    setTransactions(sortedData);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending")
        return <ChevronUp className="inline-block ml-1 size-4" />;
      if (sortConfig.direction === "descending")
        return <ChevronDown className="inline-block ml-1 size-4" />;
    }
    return <ChevronsUpDown className="inline-block ml-1 size-4" />;
  };

  return (
    <div className="p-6">
      <Card className="mb-4 max-h-[600px] flex flex-col">
        <CardHeader className="space-y-4 shadow-md">
          <h2 className="text-2xl font-bold text-blue-900">
            Branch Transactions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            <div>
              <Select
                id="transactionType"
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
              <label
                htmlFor="transactionType"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Transaction Type
              </label>
            </div>
            <div>
              <Select
                id="method"
                value={tempFilters.method}
                onValueChange={(value) => handleFilterChange("method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="online-transfer">
                    Online Transfer
                  </SelectItem>
                  <SelectItem value="atm-cdm">ATM/CDM</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="via_employee">Via Employee</SelectItem>
                </SelectContent>
              </Select>
              <label
                htmlFor="method"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Transaction Method
              </label>
            </div>
            <div>
              <Select
                id="accountId"
                value={tempFilters.accountId}
                onValueChange={(value) =>
                  handleFilterChange("accountId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Account No" />
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
              <label
                htmlFor="accountId"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Account Number
              </label>
            </div>
            <div>
              <DatePicker
                id="start-date"
                field={{
                  value: tempFilters.startDate,
                  onChange: (value) => handleFilterChange("startDate", value),
                  dateFormat: "P",
                }}
              />
              <label
                htmlFor="startDate"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
            </div>
            <div>
              <Input
                id="minAmount"
                type="number"
                placeholder="Min Amount"
                value={tempFilters.minAmount}
                onChange={(e) =>
                  handleFilterChange("minAmount", e.target.value)
                }
              />
              <label
                htmlFor="minAmount"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Min Amount
              </label>
            </div>
            <div>
              <Input
                id="maxAmount"
                type="number"
                placeholder="Max Amount"
                value={tempFilters.maxAmount}
                onChange={(e) =>
                  handleFilterChange("maxAmount", e.target.value)
                }
              />
              <label
                htmlFor="maxAmount"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Max Amount
              </label>
            </div>
          </div>
          <div className="flex justify-start space-x-2 mt-4 pt-3">
            <Button
              variant="outline"
              onClick={cancelFilters}
              className="hover:bg-blue-50 hover:border-blue-900"
            >
              Reset Filters
            </Button>
            <Button
              onClick={applyFilters}
              className=" bg-blue-900 hover:bg-teal-950"
            >
              Apply Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto flex-grow relative">
          <Table>
          <TableHeader>
              <TableRow>
                <TableHead>Account No</TableHead>
                <TableHead
                  onClick={() => sortData("amount")}
                  className="cursor-pointer"
                >
                  Amount {getSortIcon("amount")}
                </TableHead>
                <TableHead
                  onClick={() => sortData("trans_timestamp")}
                  className="cursor-pointer"
                >
                  Date {getSortIcon("trans_timestamp")}
                </TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="max-h-[400px] overflow-y-auto">
              {!isLoading ? transactions.map((transaction) => (
                <TableRow
                  key={transaction.transaction_id + transaction.transactionType}
                >
                  <TableCell>{transaction.account_number}</TableCell>
                  <TableCell
                    className={`text-gray-800 font-semibold ${
                      transaction.trans_type === "debit"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {transaction.trans_type === "debit" ? "-" : ""} Rs.{" "}
                    {Number(transaction.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
              )) : 
              <div>Loading...</div>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Transactioncharts />
      <TotalTransactionAmountChart />
    </div>
  );
}
