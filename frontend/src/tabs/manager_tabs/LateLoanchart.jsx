"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { callGetLateLoanreports} from "../../api/LoanApi"

export default function LoanDetailsChart() {
  const [timeRange, setTimeRange] = useState("monthly")
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

        const data = await callGetLateLoanreports(filters)

        // Process and format the data
        const formattedData = data.map(item => {
          let formattedDate;
          let sortValue;

          if (timeRange === "quarterly" && item.due_quarter) {
            const [year, quarter] = item.due_quarter.split("-Q")
            formattedDate = `Q${quarter} ${year}`
            sortValue = parseInt(year) * 10 + parseInt(quarter)
          } else if (timeRange === "half_year" && item.due_half_year) {
            const [year, half] = item.due_half_year.split("-H")
            formattedDate = half === "1" ? `First Half ${year}` : `Second Half ${year}`
            sortValue = parseInt(year) * 10 + parseInt(half)
          } else if (timeRange === "monthly" && item.due_month) {
            const [year, month] = item.due_month.split("-")
            const date = new Date(year, month - 1) // month is 0-indexed in JS
            formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(date)
            sortValue = new Date(item.due_month + "-01").getTime()
          } else if (timeRange === "annual" && item.due_year) {
            formattedDate = item.due_year
            sortValue = parseInt(item.due_year)
          } else {
            // If we don't have the expected data, use a default value
            formattedDate = "Unknown"
            sortValue = 0
          }

          return {
            approved_date: formattedDate,
            avg_loan_amount: Number(item.avg_installment_amount) || 0,
            max_loan_amount: Number(item.max_installment_amount) || 0,
            min_loan_amount: Number(item.min_installment_amount) || 0,
            total_loan_amount: Number(item.total_installment_amount) || 0,
            loan_count: Number(item.installment_count) || 0,
            sort_value: sortValue
          }
        })

        // Sort data by sort_value
        const sortedData = formattedData.sort((a, b) => {
          if (Math.floor(a.sort_value / 10) === Math.floor(b.sort_value / 10)) {
            // Same year, sort by quarter or half
            return a.sort_value % 10 - b.sort_value % 10;
          }
          // Different years, sort by year
          return a.sort_value - b.sort_value;
        });

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
      <Card className="w-full mb-4">
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
      <Card className="w-full mb-4">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">Loan Details Chart</CardTitle>
        <CardDescription className="text-teal-600">View average, minimum, and maximum loan amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select onValueChange={(value) => setTimeRange(value)} value={timeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="half_year">Half Year</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
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
              <Line type="monotone" dataKey="avg_loan_amount" stroke="hsl(var(--primary))" name="Avg Loan Amount" />
              <Line type="monotone" dataKey="max_loan_amount" stroke="green" name="Max Loan Amount" />
              <Line type="monotone" dataKey="min_loan_amount" stroke="hsl(var(--destructive))" name="Min Loan Amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}