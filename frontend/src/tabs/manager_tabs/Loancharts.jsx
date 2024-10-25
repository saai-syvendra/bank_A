"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { callGetFilteredLoanreports } from "../../api/LoanApi"

export default function LoanDetailsChart() {
  const [timeRange, setTimeRange] = useState("weekly")
  const [loanData, setLoanData] = useState([])
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
          loanState: null,
          loanPlan: null,
          showLateOnly: false,
          time: timeRange,
        }

        const data = await callGetFilteredLoanreports(filters)

        // Process and format the data
        const formattedData = data.map(item => ({
          approved_date: timeRange === "weekly"
            ? `Week ${String(item.approved_week).slice(4)}, ${String(item.approved_week).slice(0, 4)}`
            : new Date(item.approved_month + "-01").toLocaleString("en-US", { month: "long", year: "numeric" }), 
          avg_loan_amount: Number(item.avg_loan_amount) || 0,
          max_loan_amount: Number(item.max_loan_amount) || 0,
          min_loan_amount: Number(item.min_loan_amount) || 0,
          total_loan_amount: Number(item.total_loan_amount) || 0,
          loan_count: Number(item.loan_count) || 0,
          sort_date: timeRange === "weekly" ? parseInt(item.approved_week) : new Date(item.approved_month + "-01").getTime() 
        }))

        // Sort data by the `sort_date`
        const sortedData = formattedData.sort((a, b) => a.sort_date - b.sort_date)

        setLoanData(sortedData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching loan data:", error)
        setError("Failed to fetch loan data. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

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
            <p className="text-muted-foreground">Loading loan data...</p>
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
        <CardTitle>Loan Details Chart</CardTitle>
        <CardDescription>View average, minimum, and maximum loan amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select onValueChange={(value) => setTimeRange(value)} value={timeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loanData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="approved_date" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                labelFormatter={(label) => `Approved: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="avg_loan_amount" stroke="hsl(var(--primary))" name="Average Loan Amount" />
              <Line type="monotone" dataKey="max_loan_amount" stroke="green" name="Maximum Loan Amount" />
              <Line type="monotone" dataKey="min_loan_amount" stroke="hsl(var(--destructive))" name="Minimum Loan Amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
