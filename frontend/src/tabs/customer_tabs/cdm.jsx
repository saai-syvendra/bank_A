import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { callGetATMInformation } from "../../api/AccountApi";
import { Separator } from "@/components/ui/separator";

// // Mock function for API call
// const callGetATMInformation = async (accountNumber) => {
//   // Simulating API call
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   if (accountNumber === "1234567890") {
//     return { success: true, name: "John Doe" };
//   }
//   throw new Error("Invalid account number");
// };

// Mock function for deposit
const makeDeposit = async (accountNumber, amount, reason) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true, message: "Deposit successful" };
};

export default function CDM() {
  const [step, setStep] = useState(1);
  const [accountInfo, setAccountInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { register, handleSubmit, reset } = useForm();

  const handleAccountSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log(data.accountNumber);
      const info = await callGetATMInformation(data.accountNumber);
      console.log(info);
      setAccountInfo(info);
      setStep(2);
      toast.success("Account verified");
    } catch (error) {
      toast.error(error.message || "Invalid account number");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositSubmit = async (data) => {
    setIsLoading(true);
    setStep(3);

    // Simulate counting money
    for (let i = 0; i <= 100; i++) {
      setProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    try {
      await makeDeposit(
        data.accountNumber,
        parseFloat(data.amount),
        data.reason
      );
      toast.success("Deposit successful");
      reset();
      setStep(1);
      setAccountInfo(null);
    } catch (error) {
      toast.error("Error: Deposit failed");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Cash Deposit Machine
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm text-secondary-foreground">
          Deposit cash to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        {step === 1 && (
          <form onSubmit={handleSubmit(handleAccountSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter your account number"
                  {...register("accountNumber", { required: true })}
                />
              </div>
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Account"}
            </Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmit(handleDepositSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="amount">Deposit Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  {...register("amount", { required: true, min: 1 })}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="reason">Reason for Deposit</Label>
                <Input
                  id="reason"
                  placeholder="Enter reason"
                  {...register("reason", { required: true })}
                />
              </div>
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Make Deposit"}
            </Button>
          </form>
        )}
        {step === 3 && (
          <div className="flex flex-col items-center space-y-4">
            <Progress value={progress} className="w-full" />
            <p>Counting and verifying cash...</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {accountInfo && <p>Welcome, {accountInfo.name}</p>}
      </CardFooter>
    </Card>
  );
}
