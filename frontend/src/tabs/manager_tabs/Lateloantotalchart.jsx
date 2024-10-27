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
          let sort_date;
        
          if (timeRange === "quarterly" && item.due_quarter) {
            const [year, quarter] = item.due_quarter.split("-Q");
            formattedDate = `Q${quarter} ${year}`;
            sort_date = parseInt(year) * 10 + parseInt(quarter);
          } else if (timeRange === "half_year" && item.due_half_year) {
            const [year, half] = item.due_half_year.split("-H");
            formattedDate = half === "1" ? `First Half ${year}` : `Second Half ${year}`;
            sort_date = parseInt(year) * 10 + parseInt(half);
          } else if (timeRange === "monthly" && item.due_month) {
            const [year, month] = item.due_month.split("-");
            const date = new Date(year, month - 1); // month is 0-indexed in JS
            formattedDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(date);
            sort_date = date.getTime();
          } else if (timeRange === "annual" && item.due_year) {
            formattedDate = item.due_year;
            sort_date = parseInt(item.due_year);
          } else {
            // Default if no date is available
            formattedDate = "Unknown";
            sort_date = 0;
          }
        
          return {
            due_date: formattedDate,
            total_late_loan_amount: Number(item.total_installment_amount) || 0,
            late_loan_count: Number(item.installment_count) || 0,
            sort_date: sort_date
          };
        });
        
        // Sort data by `sort_date` with additional checks for same year cases
        const sortedData = formattedData.sort((a, b) => {
          if (Math.floor(a.sort_date / 10) === Math.floor(b.sort_date / 10)) {
            // Same year, sort by quarter or half
            return a.sort_date % 10 - b.sort_date % 10;
          }
          // Different years, sort by year
          return a.sort_date - b.sort_date;
        });
        

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
        <CardTitle className="text-2xl font-bold text-blue-900">Total Late Loan Amount Chart</CardTitle>
        <CardDescription className="text-teal-600">View total late loan amounts over time</CardDescription>
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { due_date, total_late_loan_amount, late_loan_count } = payload[0].payload; // Access the data from the payload
                      return (
                        <div className="custom-tooltip bg-white border border-gray-300 p-2 rounded shadow-lg">
                          <p className="label" style={{ color: 'red' }}>{`Due on: ${due_date}`}</p>
                          <p className="desc">{`Total Late Loan Amount: ${formatCurrency(total_late_loan_amount)}`}</p>
                          <p className="desc">{`No.of Installments: ${late_loan_count}`}</p>
                        </div>
                      );
                    }
                    return null; // If not active, return null
                  }}
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