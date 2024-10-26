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
import { callCreateAccount, callGetSavingPlans } from "../api/AccountApi";
import { callGetCustomerNames } from "../api/CustomerApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  customerId: z.coerce.number().min(10000, "Please select a customer"),
  accountType: z.enum(["checking", "saving"]),
  balance: z.coerce.number().min(0, "Initial amount must be 0 or greater"),
});

export default function CreateAccountForm({ triggerFetchCustomers = false, individualCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      accountType: "checking",
      balance: 0,
    },
  });

  const fetchCustomers = async () => {
    try {
      const customerType = individualCustomer ? "individual" : "organisation";
      const fetchedCustomers = await callGetCustomerNames(customerType);
      setCustomers(fetchedCustomers);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  const onSave = async (data) => {
    setIsLoading(true);
    console.log(data);
    try {
      await callCreateAccount(data);
      toast.success("Account created successfully");
      form.reset({
        customerId: "",
        accountType: "checking",
        balance: 0,
      });
    } catch (error) {
      toast.error(error.message || "Account creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (triggerFetchCustomers) {
      fetchCustomers();
    }
  }, [triggerFetchCustomers]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create {individualCustomer ? "Individual" : "Organization"} Account</CardTitle>
        <p className="text-gray-400 text-sm text-secondary-foreground">
          Fill out the form to create a new account
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
                  <FormItem className={`${!individualCustomer ? 'md:col-span-2' : ''}`}>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {individualCustomer && (
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="saving">Saving</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} step={0.01} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoading ? (
              <LoadingButton className="w-full"/>
            ) : (
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
