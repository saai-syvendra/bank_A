import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { callGetCDMInformation, callMakeCDMdeposit } from "../api/MachineApi";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const accountFormSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
});

const depositFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  reason: z.string().min(1, "Reason is required"),
});

export default function CDM() {
  const [step, setStep] = useState(1);
  const [accountInfo, setAccountInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const accountForm = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountNumber: "",
    },
  });

  const depositForm = useForm({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: "",
      reason: "",
    },
  });

  const handleAccountSubmit = async (data) => {
    setIsLoading(true);
    try {
      const info = await callGetCDMInformation(data.accountNumber);
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
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    try {
      await callMakeCDMdeposit({
        account_id: accountInfo.accountId,
        amount: parseFloat(data.amount),
        reason: data.reason,
      });
      toast.success("Deposit successful");
      accountForm.reset();
      depositForm.reset();
      setStep(1);
      setAccountInfo(null);
    } catch (error) {
      toast.error(error.message || "Error: Deposit failed");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleBackClick = () => {
    setAccountInfo(null);
    accountForm.reset();
    depositForm.reset();
    setStep(1);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">
          Cash Deposit Machine
        </CardTitle>
        <CardDescription className="text-teal-600 text-sm">
          Deposit cash to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        {step === 1 && (
          <Form {...accountForm}>
            <form
              onSubmit={accountForm.handleSubmit(handleAccountSubmit)}
              className="space-y-4"
            >
              <FormField
                control={accountForm.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your account number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full bg-blue-900 hover:bg-teal-950" type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>
            </form>
          </Form>
        )}
        {step === 2 && (
          <Form {...depositForm}>
            <form
              onSubmit={depositForm.handleSubmit(handleDepositSubmit)}
              className="space-y-4"
            >
              <FormField
                control={depositForm.control}
                name="name"
                render={() => (
                  <FormItem>
                    <FormLabel>Account holder name</FormLabel>
                    <FormControl>
                      <Input value={accountInfo.name} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={depositForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={depositForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Deposit</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reason" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between space-x-2">
                <Button
                  className="w-1/2 bg-blue-900 hover:bg-teal-950"
                  type="button"
                  onClick={handleBackClick}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="w-1/2 bg-blue-900 hover:bg-teal-950">
                  {isLoading ? "Processing..." : "Make Deposit"}
                </Button>
              </div>
            </form>
          </Form>
        )}
        {step === 3 && (
          <div className="flex flex-col items-center space-y-4">
            <Progress value={progress} className="w-full" />
            <p>Counting and verifying cash...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
