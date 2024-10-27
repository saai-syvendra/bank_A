import { useState, useEffect } from "react";
import LoanCard from "../../components/LoanCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { callGetApprovalPendingLoans } from "../../api/LoanApi";

export default function LoanApprovalList() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const data = await callGetApprovalPendingLoans();
      setLoans(data);
      console.log(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleLoanStatusChange = () => {
    fetchLoans();
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">
          Loans Pending Approval
        </CardTitle>
        <p className="text-teal-600 text-sm text-secondary-foreground">
          Approve or reject pending branch loans
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-2">
        {isLoading ? (
          <p>Loading loans...</p>
        ) : loans.length === 0 ? (
          <p>No loans pending approval.</p>
        ) : (
          loans.map((loan) => (
            <LoanCard
              key={loan.loan_id}
              loan={loan}
              onStatusChange={handleLoanStatusChange}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
