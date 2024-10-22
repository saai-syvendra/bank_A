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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
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

  const form = useForm({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      accountNo: "",
      accountID: "",
      firstName: "",
      lastName: "",
      amount: 0,
      reason: "",
    },
  });

  const fetchCustomerDetails = async (accountNo) => {
    setIsCustomerLoading(true);
    try {
      const data = await callGetCustomerDetailsFromAccountNo(accountNo);
      form.setValue("firstName", data.firstName);
      form.setValue("lastName", data.lastName);

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
    if (accountNo.length > 0) {
      fetchCustomerDetails(accountNo);
    }
  }, [accountNo]);

  useEffect(() => {
    const subscription = form.watch((value) => setAccountNo(value.accountNo));
    return () => subscription.unsubscribe();
  }, [form]);

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

            <FormField
              control={form.control}
              name="accountID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={true} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <LoadingButton />
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
