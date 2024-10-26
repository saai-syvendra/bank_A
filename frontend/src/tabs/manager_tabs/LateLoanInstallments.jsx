import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Loancharts from "./Loancharts"
import LateLoanchart from "./LateLoanchart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


import { callGetFilteredLoans } from '../../api/LoanApi'; 

const loanStates = ['all', 'pending', 'approved', 'online']
const loanPlans = ['all', 'housing loan', 'short loan']

export default function LoanDetailsPage() {
  const [loans, setLoans] = useState([])
  const [showLateOnly, setShowLateOnly] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [loanState, setLoanState] = useState('all')
  const [loanPlan, setLoanPlan] = useState('all')
  const [loading, setLoading] = useState(false)


  const fetchLoans = async () => {
    setLoading(true)
    try {
      const filters = {
        startDate,
        endDate,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        loan_state: loanState !== 'all' ? loanState : undefined,
        loan_plan: loanPlan !== 'all' ? loanPlan : undefined,
        showLateOnly: showLateOnly || undefined,
      };
      const data = await callGetFilteredLoans(filters);
      setLoans(data);
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchLoans()
  }, [startDate, endDate, minAmount, maxAmount, loanState, loanPlan, showLateOnly])

  const resetFilters = () => {
    setShowLateOnly(false)
    setStartDate('')
    setEndDate('')
    setMinAmount('')
    setMaxAmount('')
    setLoanState('all')
    setLoanPlan('all')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Loan Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="lateOnly"
            checked={showLateOnly}
            onCheckedChange={setShowLateOnly}
          />
          <Label htmlFor="lateOnly">Show Late Only</Label>
        </div>
        
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="minAmount">Min Amount</Label>
          <Input
            id="minAmount"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="Min Amount"
          />
        </div>
        
        <div>
          <Label htmlFor="maxAmount">Max Amount</Label>
          <Input
            id="maxAmount"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="Max Amount"
          />
        </div>
        
        <div>
          <Label htmlFor="loanState">Loan State</Label>
          <Select value={loanState} onValueChange={setLoanState}>
            <SelectTrigger id="loanState">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {loanStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="loanPlan">Loan Plan</Label>
          <Select value={loanPlan} onValueChange={setLoanPlan}>
            <SelectTrigger id="loanPlan">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              {loanPlans.map((plan) => (
                <SelectItem key={plan} value={plan}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button onClick={resetFilters} className="w-full">
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Plan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="6">Loading...</TableCell>
              </TableRow>
            ) : loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.loan_id}</TableCell>
                <TableCell>Rs.{loan.loan_amount?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>{loan.approved_date ? format(new Date(loan.approved_date), 'PP') : 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    loan.state ? loan.state.charAt(0).toUpperCase() + loan.state.slice(1) : 'N/A'
                   }`}>
                    {loan.state ? loan.state.charAt(0).toUpperCase() + loan.state.slice(1) : 'N/A'}
                  </span>
                </TableCell>
                <TableCell>{loan.plan_name ? loan.plan_name.charAt(0).toUpperCase() + loan.plan_name.slice(1) : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Loancharts/>
        <LateLoanchart/>
      </div>
      
      {loans.length === 0 && !loading && (
        <p className="text-center mt-4 text-gray-500">No loans found matching the current filters.</p>
      )}
    </div>
  )
}
