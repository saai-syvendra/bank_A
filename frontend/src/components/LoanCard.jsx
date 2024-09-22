import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { callApproveLoan } from "../api/LoanApi";
import { format } from "date-fns";
import { callRejectLoan } from "../api/LoanApi";
import { toast } from "sonner";
import { confirmAlert } from "react-confirm-alert";

export default function LoanCard({ loan, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await callApproveLoan(loan.loan_id);
      toast.success("Loan approved successfully");
      onStatusChange();
    } catch (error) {
      console.error("Error approving loan:", error);
      toast.error("Error approving loan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await callRejectLoan(loan.loan_id);
      toast.success("Loan rejected successfully");
      onStatusChange();
    } catch (error) {
      console.error("Error rejecting loan:", error);
      toast.error("Error rejecting loan");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAction = (funcToBeCalled, title, message, positive) => {
    confirmAlert({
      title: title,
      message,
      buttons: [
        {
          label: "Yes",
          onClick: funcToBeCalled,
          className: `${positive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white `,
        },
        {
          label: "No",
          className: `${positive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white `,
        },
      ],
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          Loan Amount: Rs. {loan.loan_amount}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Customer:</strong> {loan.customer_name}
          </p>
          <p>
            <strong>Account Balance:</strong> Rs. {loan.account_balance}
          </p>
          <p>
            <strong>Plan Name:</strong> {loan.plan_name}
          </p>
          <p>
            <strong>Loan Interest:</strong> {loan.plan_interest}%
          </p>
          <p>
            <strong>Account No:</strong> {loan.account_number}
          </p>
          <p>
            <strong>Loan ID: </strong> {loan.loan_id}
          </p>
          <p>
            <strong>Request Date:</strong>{" "}
            {format(new Date(loan.request_date), "PPP")}
          </p>
          <p>
            <strong>Reason:</strong> {loan.reason}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={() =>
            confirmAction(
              handleApprove,
              "Confirm approval",
              "Are you sure to approve loan?",
              true
            )
          }
          disabled={isLoading}
        >
          {isLoading ? "Approving..." : "Approve"}
        </Button>
        <Button
          onClick={() =>
            confirmAction(
              handleReject,
              "Confirm rejection",
              "Are you sure to reject loan?",
              false
            )
          }
          variant="destructive"
          disabled={isLoading}
        >
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
