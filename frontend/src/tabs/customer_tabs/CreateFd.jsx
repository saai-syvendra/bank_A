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
import { callCreateFd, callGetFdPlans } from "../../api/FdApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { callGetThisCustomerAccounts } from "../../api/AccountApi";
import { useOTP } from "../../auth/OtpContext";
import { OTPDialog } from "@/components/OtpDialog";
import { formatAccountDetails } from "../../helper/stringFormatting";

const formSchema = z.object({
  planId: z.coerce.number().min(1, "Please select a plan"),
  connectedAccount: z.coerce.number().min(1, "Please select an account"),
  fdAmount: z.coerce.number().min(0, "Loan amount must be greater than 0"),
});

const CreateFd = ({ triggerToRefetch }) => {
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendOtp, isVerifying } = useOTP();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: "",
      connectedAccount: "",
      fdAmount: 0,
    },
  });

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await callGetFdPlans();
      setPlans(fetchedPlans);
      // console.log("Plans", fetchedPlans);
    } catch (error) {
      toast.error(error.message || "Failed to fetch FD plans");
    }
  };

  const fetchAccounts = async () => {
    try {
      const fetchedAccounts = await callGetThisCustomerAccounts("saving");
      // console.log("Accounts", fetchedAccounts);
      setAccounts(fetchedAccounts);
    } catch (error) {
      toast.error(error.message || "Failed to fetch customer accounts");
    }
  };

  const onSave = async () => {
    setIsLoading(true);
    try {
      await sendOtp();
    } catch (error) {
      toast.error(error.message || "Failed to initiate OTP verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFdCreation = async (data) => {
    setIsLoading(true);
    try {
      const data = form.getValues();
      await callCreateFd(data);
      toast.success("FD created successfully");
      fetchAccounts();
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "FD creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (triggerToRefetch) {
      fetchAccounts();
      fetchPlans();
    }
  }, [triggerToRefetch]);

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-900">
            Create Fixed Deposit
          </CardTitle>
          <p className="text-teal-600 text-sm text-secondary-foreground">
            Fill out the form to create a Fixed Deposit
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a FD plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem
                              key={plan.id}
                              value={plan.id.toString()}
                            >
                              {`${plan.name} - ${
                                plan.interest
                              }% , ${plan.months} Months`}
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
                  name="connectedAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connected Savings Account</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
                  name="fdAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FD Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isLoading ? (
                <LoadingButton className="w-full" />
              ) : (
                <Button type="submit" className="w-full bg-blue-900 hover:bg-teal-950">
                  Create Fixed Deposit
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      <OTPDialog onVerificationSuccess={handleFdCreation} />
    </>
  );
};

export default CreateFd;
