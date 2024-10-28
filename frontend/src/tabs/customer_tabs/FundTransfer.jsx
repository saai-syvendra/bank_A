import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { callGetThisCustomerAccounts } from "../../api/AccountApi";
import { callMakeOnlineTransfer } from "../../api/TransactionApi";
import { Textarea } from "@/components/ui/textarea";
import { useOTP } from "../../auth/OtpContext";
import { OTPDialog } from "@/components/OtpDialog";
import { formatAccountDetails } from "../../helper/stringFormatting";

const formSchema = z.object({
  fromAccountId: z.coerce
    .number()
    .min(1, "Please select an account to transfer from"),
  fromAccountNo: z.coerce.number(), // Add fromAccountNumber to compare with toAccountNo
  toAccountNo: z.coerce
    .number()
    .min(100000000000, "Please select an account to transfer to"),
  amount: z.coerce.number().min(0, "Transfer amount must be greater than 0"),
  reason: z.string().min(1, "Please provide a reason for the transfer"),
}).refine(
  (data) => data.fromAccountNo !== data.toAccountNo, // Compare actual account numbers
  {
    message: "From account and To account must be different",
    path: ["toAccountNo"], // Shows error message under 'To Account'
  }
);

const FundTransfer = ({ triggerToRefetch }) => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendOtp, isVerifying } = useOTP();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromAccountId: "",
      toAccountNo: "",
      amount: 0,
      reason: "",
    },
  });

  const fetchAccounts = async () => {
    try {
      const fetchedAccounts = await callGetThisCustomerAccounts();
      //console.log("Accounts", fetchedAccounts);
      setAccounts(fetchedAccounts);
    } catch (error) {
      toast.error(error.message || "Failed to fetch customer accounts");
    }
  };

  const onSave = async () => {
    setIsLoading(true);
    try {
      await sendOtp("Fund transfer");
    } catch (error) {
      toast.error("Failed to initiate OTP verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundTransfer = async () => {
    setIsLoading(true);
    try {
      const data = form.getValues();
      // const transferData = {
      //   ...data,
      //   fromAccountNumber: selectedAccount.account_number,
      // };
      // console.log(data);
      await callMakeOnlineTransfer(data);
      toast.success("Online transfer successful");
      fetchAccounts();
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Online transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (triggerToRefetch) {
      fetchAccounts();
    }
  }, [triggerToRefetch]);

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-900">Online Transfer</CardTitle>
          <p className="text-teal-600 text-sm text-secondary-foreground">
            Fill out the details to make a transfer
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Account</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const selectedAccount = accounts.find(
                            (account) => account.account_id.toString() === value
                          );
                          form.setValue("fromAccountId", value);
                          form.setValue("fromAccountNo", selectedAccount.account_number);
            
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toAccountNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Account</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-white" rows={1} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isLoading || isVerifying ? (
                <LoadingButton className="w-full" />
              ) : (
                <Button type="submit" className="w-full bg-blue-900 hover:bg-teal-950">
                  Make Transfer
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      <OTPDialog onVerificationSuccess={handleFundTransfer} />
    </>
  );
};

export default FundTransfer;