import { useState, useEffect } from "react";
import LoanCard from "../../components/LoanCard";
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Loans Pending Approval</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loans.length === 0 ? (
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
      </div>
    </div>
  );
}
