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
import { callCreateAccount, callGetSavingPlans } from "../../api/AccountApi";
import { callGetCustomerNames } from "../../api/CustomerApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  customerId: z.coerce.number().min(10000, "Please select a customer"),
  accountType: z.enum(["checking", "saving"]),
  planId: z.coerce.number().min(0),
  balance: z.coerce.number().min(0, "Initial amount must be 0 or greater"),
});

export default function CreateAccount({ triggerFetchCustomers = false }) {
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      accountType: "checking",
      planId: "",
      balance: 0,
    },
  });

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await callGetSavingPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      toast.error("Failed to fetch saving plans");
    }
  };

  const fetchCustomers = async () => {
    try {
      const fetchedCustomers = await callGetCustomerNames();
      setCustomers(fetchedCustomers);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  const onSave = async (data) => {
    setIsLoading(true);
    console.log(data);
    try {
      if (data.accountType === "checking") {
        data.planId = null;
      } else if (data.planId === "" || data.planId === 0) {
        throw new Error("Please select a plan for saving account");
      }
      await callCreateAccount(data);
      toast.success("Account created successfully");
      form.reset({
        customerId: "",
        accountType: "checking",
        planId: "",
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

  useEffect(() => {
    if (form.watch("accountType") === "saving") {
      fetchPlans();
    } else {
      form.setValue("planId", "");
      form.setValue("balance", 0);
    }
  }, [form.watch("accountType")]);

  useEffect(() => {
    const selectedPlan = plans.find(
      (plan) => plan.plan_id === Number(form.watch("planId"))
    );
    if (selectedPlan) {
      form.setValue("balance", selectedPlan.minimum_balance);
    } else {
      form.setValue("balance", 0);
    }
  }, [form.watch("planId"), plans]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
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
                  <FormItem>
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
            </div>

            {form.watch("accountType") === "saving" && (
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem
                            key={plan.plan_id}
                            value={plan.plan_id.toString()}
                          >
                            {`${plan.plan_name} - ${plan.interest}% interest, Min Balance: Rs. ${plan.minimum_balance}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
              <LoadingButton />
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
