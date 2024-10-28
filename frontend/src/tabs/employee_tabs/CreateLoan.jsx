import React, { useEffect, useState } from "react";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { callCreateLoan, callGetLoanPlans } from "../../api/LoanApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { callGetCustomerNames } from "../../api/CustomerApi";
import { callGetCustomerAccounts } from "../../api/AccountApi";
import { Textarea } from "@/components/ui/textarea";
import { useOTP } from "../../auth/OtpContext";
import { OTPDialog } from "@/components/OtpDialog";
import { formatAccountDetails } from "../../helper/stringFormatting";

const formSchema = z.object({
  customerId: z.coerce.number().min(10000, "Please select a customer"),
  planId: z.coerce.number().min(1, "Please select a plan"),
  connectedAccount: z.coerce.number().min(1, "Please select an account"),
  loanAmount: z.coerce.number().min(0, "Loan amount must be greater than 0"),
  reason: z
    .string()
    .min(1, "Reason required")
    .max(100, "Reason must be less than 100 characters"),
});

const CreateLoan = ({ triggerFetchCustomers }) => {
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendOtp, isVerifying } = useOTP();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      planId: "",
      connectedAccount: "",
      loanAmount: 0,
      reason: "",
    },
  });

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await callGetLoanPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      toast.error(error.message || "Failed to fetch loan plans");
    }
  };

  const fetchCustomers = async () => {
    try {
      const fetchedCustomers = await callGetCustomerNames();
      setCustomers(fetchedCustomers);
    } catch (error) {
      toast.error(error.message || "Failed to fetch customers");
    }
  };

  const fetchAccounts = async (customerId) => {
    try {
      const fetchedAccounts = await callGetCustomerAccounts(customerId);
      setAccounts(fetchedAccounts);
    } catch (error) {
      toast.error(error.message || "Failed to fetch customer accounts");
    }
  };

  const onSave = async (data) => {
    setIsLoading(true);
    try {
      await sendOtp("Customer Loan Request");
    } catch (error) {
      toast.error("Failed to initiate OTP verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoanSubmission = async () => {
    setIsLoading(true);
    try {
      const loanData = form.getValues();
      await callCreateLoan(loanData);
      toast.success("Loan request submitted successfully");
      form.reset({
        customerId: "",
        planId: "",
        connectedAccount: "",
        loanAmount: 0,
        reason: "",
      });
    } catch (error) {
      toast.error(error.message || "Loan request submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (triggerFetchCustomers) {
      fetchCustomers();
    }
  }, [triggerFetchCustomers]);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const customerId = form.watch("customerId");
    if (customerId) {
      fetchAccounts(customerId);
    }
  }, [form.watch("customerId")]);

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-900">
            Create Loan Request
          </CardTitle>
          <p className="text-teal-600 text-sm text-secondary-foreground">
            Fill out the form to submit a loan request
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem
                              key={customer.customerId}
                              value={customer.customerId.toString()}
                            >
                              {`${customer.customerId} - ${customer.name} - ${customer.customerType}`}
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
                            <SelectValue placeholder="Select a loan plan" />
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
                              }% , Max Amount: Rs.${parseFloat(
                                plan.max_amount
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
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
                      <FormLabel>Connected Account</FormLabel>
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
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount</FormLabel>
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
                    <FormItem className="col-span-2">
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-white" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isLoading || isVerifying ? (
                <LoadingButton className="w-full" />
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-teal-950"
                >
                  Submit Loan Request
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      <OTPDialog onVerificationSuccess={handleLoanSubmission} />
    </>
  );
};

export default CreateLoan;
