"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { callGetTransactionReports } from "../../api/TransactionApi" 

export default function TransactionDetailsChart() {
  const [timeRange, setTimeRange] = useState("weekly")
  const [transactionType, setTransactionType] = useState("all")
  const [transactionData, setTransactionData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const filters = {
          startDate: null,
          endDate: null,
          minAmount: null,
          maxAmount: null,
          transactionType: transactionType === "all" ? null : transactionType,
          time: timeRange,
        }

        const data = await callGetTransactionReports(filters)
        console.log(data);
        
        // Process and format the data
        const formattedData = data.map(item => {
          let formattedDate;

          if (timeRange === "weekly") {
            const year = String(item.transaction_week).slice(0, 4);
            const week = String(item.transaction_week).slice(4);
            formattedDate = `Week ${week}, ${year}`;
          } else if (timeRange === "monthly") {
            const [year, month] = item.transaction_month.split("-");
            const date = new Date(year, month - 1); // month is 0-indexed in JS
            formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(date);
          }

          return {
            date: formattedDate,
            avg_transaction_amount: Number(item.avg_trans_amount) || 0,
            max_transaction_amount: Number(item.max_trans_amount) || 0,
            min_transaction_amount: Number(item.min_trans_amount) || 0,
            total_transaction_amount: Number(item.total_trans_amount) || 0,
            transaction_count: Number(item.transaction_count) || 0
          }
        });

        formattedData.sort((a, b) => {
          if (timeRange === "weekly") {
            return parseInt(a.date.match(/\d+/)[0]) - parseInt(b.date.match(/\d+/)[0]);
          } else if (timeRange === "monthly") {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
          }
          return 0;
        });

        setTransactionData(formattedData);
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching transaction data:", error)
        setError("Failed to fetch transaction data. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange, transactionType])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', notation: 'compact', maximumFractionDigits: 1 }).format(value)
  }

  const formatYAxis = (value) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">Loading transaction data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction Details Chart</CardTitle>
        <CardDescription>View average, minimum, and maximum transaction amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-4">
          <Select onValueChange={(value) => setTimeRange(value)} value={timeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setTransactionType(value)} value={transactionType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transactionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="avg_transaction_amount" stroke="hsl(var(--primary))" name="Average Transaction Amount" />
              <Line type="monotone" dataKey="max_transaction_amount" stroke="green" name="Maximum Transaction Amount" />
              <Line type="monotone" dataKey="min_transaction_amount" stroke="hsl(var(--destructive))" name="Minimum Transaction Amount"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
