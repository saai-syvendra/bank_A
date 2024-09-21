import { useState, useEffect } from "react";
import LoanCard from "../../components/LoanCard";
import { callGetApprovalPendingLoans } from "../../api/LoanApi";

export default function LoanApprovalList() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // const dummyLoans = [
  //   {
  //     loan_id: "L001",
  //     plan_name: "Home Loan",
  //     customer_name: "John Doe",
  //     account_id: "A1001",
  //     account_balance: 12000.5,
  //     loan_amount: 250000.0,
  //     request_date: "2023-08-15",
  //     reason: "To purchase a new home",
  //   },
  //   {
  //     loan_id: "L002",
  //     plan_name: "Car Loan",
  //     customer_name: "Jane Smith",
  //     account_id: "A1002",
  //     account_balance: 8000.25,
  //     loan_amount: 35000.0,
  //     request_date: "2023-09-01",
  //     reason: "To buy a new car",
  //   },
  //   {
  //     loan_id: "L003",
  //     plan_name: "Business Loan",
  //     customer_name: "Robert Johnson",
  //     account_id: "A1003",
  //     account_balance: 15000.75,
  //     loan_amount: 100000.0,
  //     request_date: "2023-09-10",
  //     reason: "For business expansion",
  //   },
  //   {
  //     loan_id: "L004",
  //     plan_name: "Personal Loan",
  //     customer_name: "Emily Davis",
  //     account_id: "A1004",
  //     account_balance: 2000.0,
  //     loan_amount: 5000.0,
  //     request_date: "2023-07-25",
  //     reason: "For personal expenses",
  //   },
  //   {
  //     loan_id: "L005",
  //     plan_name: "Education Loan",
  //     customer_name: "Michael Brown",
  //     account_id: "A1005",
  //     account_balance: 500.0,
  //     loan_amount: 20000.0,
  //     request_date: "2023-08-05",
  //     reason: "For college tuition fees",
  //   },
  // ];

  // setLoans(dummyLoans);

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
