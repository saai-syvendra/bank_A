"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { callGetLateLoanreports } from "../../api/LoanApi"

export default function TotalLateLoanAmountChart() {
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

          if (timeRange === "quarterly") {
            const [year, quarter] = item.due_quarter.split("-Q")
            formattedDate = `Q${quarter} ${year}`
          } else if (timeRange === "half_year") {
            const [year, half] = item.due_half_year.split("-H")
            formattedDate = half === "1" ? `First Half ${year}` : `Second Half ${year}`
          } else if (timeRange === "monthly") {
            const [year, month] = item.due_month.split("-")
            const date = new Date(year, month - 1) // month is 0-indexed in JS
            formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(date)
          } else if (timeRange === "annual") {
            formattedDate = item.due_year
          }

          return {
            due_date: formattedDate,
            total_late_loan_amount: Number(item.total_installment_amount) || 0,
            late_loan_count: Number(item.installment_count) || 0,
            sort_date: timeRange === "quarterly" || timeRange === "half_year" 
              ? parseInt(item.due_quarter || item.due_half_year) 
              : new Date(item.due_month || item.due_year + "-01").getTime()
          }
        })

        // Sort data by the `sort_date`
        const sortedData = formattedData.sort((a, b) => a.sort_date - b.sort_date)

        setLoanData(sortedData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching late loan data:", error)
        setError("Failed to fetch late loan data. Please try again later.")
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
            <p className="text-muted-foreground">Loading late loan data...</p>
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
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Total Late Loan Amount Chart</CardTitle>
        <CardDescription>View total late loan amounts over time</CardDescription>
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
            <BarChart data={loanData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="due_date" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                labelFormatter={(label) => `Due on: ${label}`}
              />
              <Legend />
              <Bar dataKey="total_late_loan_amount" fill="hsl(var(--destructive))" name="Total Late Loan Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}