import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { callGetCustomerDetailsFromAccountNo } from "../api/CustomerApi";
import { callEmployeeDepositForCustomer } from "../api/TransactionApi";
import { callGetAccountIDfromAccountNo } from "../api/AccountApi"; // Add this import

const depositFormSchema = z.object({
  accountNo: z.string().min(1, "Account number is required"),
  accountID: z.number().min(1, "Account ID is required"),
  name: z.string().min(1, "Name is required"),
  amount: z.coerce
    .number()
    .min(0.01, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  reason: z.string().min(1, "Reason is required"),
});

const EmployeeCashDepositForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);
  const [accountNo, setAccountNo] = useState("");
  const [shouldReset, setShouldReset] = useState(false);

  const form = useForm({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      accountNo: "",
      accountID: "",
      name: "",
      amount: 0,
      reason: "",
    },
  });

  const fetchCustomerDetails = async () => {
    setIsCustomerLoading(true);
    try {
      const accountNo = form.getValues("accountNo");
      const data = await callGetCustomerDetailsFromAccountNo(accountNo);
      form.setValue("name", data.name);
      // Fetch accountID
      const accountID = await callGetAccountIDfromAccountNo(accountNo);
      form.setValue("accountID", accountID);
    } catch (error) {
      toast.error("Failed to fetch customer details or account ID");
    } finally {
      setIsCustomerLoading(false);
    }
  };

  useEffect(() => {
    if (shouldReset) {
      form.reset({
        accountNo: accountNo,
        accountID: "",
        name: "",
        amount: 0,
        reason: "",
      });
      setShouldReset(false);
    }
  }, [shouldReset, accountNo, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.accountNo !== accountNo) {
        setAccountNo(value.accountNo);
        setShouldReset(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [accountNo, form]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formattedData = {
        accountNo: data.accountNo.toString(),
        account_id: Number(data.accountID),
        amount: data.amount,
        reason: data.reason,
      };
      //console.log("Sending data:", formattedData); // Log the data being sent
      await callEmployeeDepositForCustomer(formattedData);
      toast.success("Deposit successful");
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error("Deposit failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Cash Deposit</CardTitle>
        <p className="text-gray-400 text-sm text-secondary-foreground">
          Deposit cash for a customer
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Separator />

            <FormField
              control={form.control}
              name="accountNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={fetchCustomerDetails}
              disabled={isCustomerLoading}
            >
              {isCustomerLoading ? "Loading..." : "Fetch Customer Details"}
            </Button>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={true} />
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-white" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoading ? (
              <LoadingButton className="w-full"/>
            ) : (
              <Button type="submit" className="w-full">
                Deposit
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EmployeeCashDepositForm;