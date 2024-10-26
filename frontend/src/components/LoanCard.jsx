import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { callApproveLoan } from "../api/LoanApi";
import { format } from "date-fns";
import { callRejectLoan } from "../api/LoanApi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LoanCard({ loan, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationDetail, setConfirmationDetail] = useState({});

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

  const confirmationDetailList = {
    approval: {
      title: "Confirm approval",
      message: "Are you sure to approve loan?",
      funcToBeCalled: handleApprove,
    },
    rejection: {
      title: "Confirm rejection",
      message: "Are you sure to reject loan?",
      funcToBeCalled: handleReject,
    },
  };

  return (
    <>
      <Card className="w-full max-w-sm mb-5">
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
            onClick={() => {
              setIsConfirmationOpen(true);
              setConfirmationDetail(confirmationDetailList.approval);
            }}
            className="bg-blue-900 hover:bg-teal-950"
            disabled={isLoading}
          >
            {isLoading ? "Approving..." : "Approve"}
          </Button>
          <Button
            onClick={() => {
              setIsConfirmationOpen(true);
              setConfirmationDetail(confirmationDetailList.rejection);
            }}
            variant="destructive"
            disabled={isLoading}
          >
            Reject
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationDetail.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDetail.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmationDetail.funcToBeCalled}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
