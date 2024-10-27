import React, { useEffect, useState, useCallback } from "react";
import {
  callGetLateLoanInstallments,
  callGetLoanCustomers,
} from "../../api/LoanApi";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import Loancharts from "./Loancharts";
import LateLoanchart from "./LateLoanchart";
import Loanchartfortotal from "./Lonchartfortotal";
import Lateloantotalchart from "./Lateloantotalchart";

export default function LateLoanInstallments() {
  const [installments, setInstallments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const defaultFilters = {
    customerId: "all",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const fetchInstallments = useCallback(async () => {
    const apiFilters = { ...filters };

    if (apiFilters.startDate !== "") {
      apiFilters.startDate = new Date(apiFilters.startDate)
        .toISOString()
        .split("T")[0];
    }

    if (apiFilters.endDate !== "") {
      apiFilters.endDate = new Date(apiFilters.endDate)
        .toISOString()
        .split("T")[0];
    }

    if (apiFilters.customerId === "all") {
      apiFilters.customerId = "";
    }

    try {
      setIsLoading(true);
      const fetchedInstallments = await callGetLateLoanInstallments(apiFilters);
      setInstallments(fetchedInstallments);
      console.log("Fetched Installments", fetchedInstallments);
    } catch (error) {
      setInstallments([]);
      toast.error(error.message || "Failed to fetch installments");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchCustomers = useCallback(async () => {
    try {
      const fetchedCustomers = await callGetLoanCustomers();
      setCustomers(fetchedCustomers);
      console.log("Fetched Customers", fetchedCustomers);
    } catch (error) {
      toast.error(error.message || "Failed to fetch customers");
    }
  }, []);

  useEffect(() => {
    fetchInstallments();
  }, [fetchInstallments]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  return (
    <div className="p-6">
      <Card className="mb-4 max-h-[600px] flex flex-col">
        <CardHeader className="space-y-4">
          <h2 className="text-2xl font-bold text-blue-900">
            Late Loan Installments
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
            <div>
              <Select
                id="customerId"
                value={tempFilters.customerId}
                onValueChange={(value) =>
                  handleFilterChange("customerId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Customer ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.customer_id}
                      value={customer.customer_id}
                    >
                      {customer.customer_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label
                htmlFor="customerId"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Customer ID
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
                Late Installments From
              </label>
            </div>
            <div>
              <DatePicker
                id="end-date"
                field={{
                  value: tempFilters.endDate,
                  onChange: (value) => handleFilterChange("endDate", value),
                  dateFormat: "P",
                }}
              />
              <label
                htmlFor="endDate"
                className="flex justify-center text-xs font-medium text-gray-700 mb-1"
              >
                Late Installments To
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
            <Button variant="outline" onClick={cancelFilters}>
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
        <CardContent className="overflow-auto flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Installment No</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Days Late</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading ? installments.map((installment) => (
                <TableRow
                  key={`${installment.loan_id}-${installment.installment_no}`}
                >
                  <TableCell>{installment.loan_id}</TableCell>
                  <TableCell>{installment.customer_id}</TableCell>
                  <TableCell>
                    {installment.installment_no}
                    {"/"}
                    {installment.months}
                  </TableCell>
                  <TableCell>
                    {format(new Date(installment.due_date), "PP")}
                  </TableCell>
                  <TableCell>
                    Rs.{" "}
                    {Number(installment.installment_amount).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    {installment.paid_date
                      ? differenceInDays(
                          new Date(installment.paid_date),
                          new Date(installment.due_date)
                        )
                      : "Not Paid"}
                  </TableCell>
                </TableRow>
              )) : <div>Loading...</div>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Loancharts />
      <Loanchartfortotal />
      <LateLoanchart />
      <Lateloantotalchart />
    </div>
  );
}
function differenceInDays(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}
