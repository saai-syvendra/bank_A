import {
  callGetUpcomingInstallments,
  callPayInstallment,
} from "../../api/LoanApi";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { callGetThisCustomerAccounts } from "../../api/AccountApi";
import { formatAccountDetails } from "../../helper/stringFormatting";

const LoanPayment = () => {
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [accounts, setAccounts] = useState([]);

  const fetchUpcomingInstallments = async () => {
    try {
      const fetchedInstallments = await callGetUpcomingInstallments();
      console.log("Upcoming Installments", fetchedInstallments);
      setUpcomingInstallments(fetchedInstallments);
    } catch (error) {
      toast.error("Failed to fetch upcoming installments");
    }
  };

  const fetchAccounts = async () => {
    try {
      const fetchedAccounts = await callGetThisCustomerAccounts();
      console.log("Accounts", fetchedAccounts);
      setAccounts(fetchedAccounts);
    } catch (error) {
      toast.error("Failed to fetch customer accounts");
    }
  };

  const handlePayment = (installment) => {
    setSelectedInstallment(installment);
    setPaymentAmount(installment.installment_amount);
    setIsPaymentModalOpen(true);
  };

  const handleAccountChange = (value) => {
    setSelectedAccount(value);
  };

  const submitPayment = async () => {
    try {
      await callPayInstallment(
        selectedInstallment.id,
        selectedInstallment.installment_no,
        selectedAccount
      );
      toast.success(
        `Payment processed for Installment ${selectedInstallment.installment_no}/${selectedInstallment.months} of loan ${selectedInstallment.id}`
      );
    } catch (error) {
      toast.error(error.message || "Failed to process payment");
    } finally{
      setIsPaymentModalOpen(false);
      fetchUpcomingInstallments();
      fetchAccounts();
    }
    
  };

  useEffect(() => {
    fetchUpcomingInstallments();
    fetchAccounts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-900">Loan Payment</CardTitle>
          <p className="text-teal-600 text-sm text-secondary-foreground">
            Select and pay relevant laon installment
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID.</TableHead>
                <TableHead>Installment No.</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingInstallments.map((loan) => (
                <TableRow>
                  <TableCell>{loan.id}</TableCell>
                  <TableCell>
                    {loan.installment_no}/{loan.months}
                  </TableCell>
                  <TableCell>Rs. {loan.installment_amount}</TableCell>
                  <TableCell>{format(new Date(loan.due_date), "PP")}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handlePayment(loan)}
                      disabled={loan.state !== "pending"}
                      className="bg-blue-900 hover:bg-teal-950"
                    >
                      Pay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to make a payment of Rs. {paymentAmount} for
              installment {selectedInstallment?.installment_no} of{" "}
              {selectedInstallment?.id}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="account-select">Connected Account</Label>
            <Select onValueChange={handleAccountChange} value={selectedAccount}>
              <SelectTrigger id="account-select">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem
                    key={account.account_id}
                    value={account.account_id.toString()}
                  >
                    {formatAccountDetails(account)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={submitPayment}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <OTPDialog onVerificationSuccess={submitPayment} /> */}
    </div>
  );
};

export default LoanPayment;
