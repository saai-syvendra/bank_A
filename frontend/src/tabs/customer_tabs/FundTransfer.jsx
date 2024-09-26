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

const formSchema = z.object({
  fromAccountId: z.coerce
    .number()
    .min(1, "Please select an account to transfer from"),
  toAccountNo: z.coerce
    .number()
    .min(100000000000, "Please select an account to transfer to"),
  amount: z.coerce.number().min(0, "Transfer amount must be greater than 0"),
  reason: z.string().min(1, "Please provide a reason for the transfer"),
});

const FundTransfer = ({ triggerToRefetch }) => {
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      console.log("Accounts", fetchedAccounts);
      setAccounts(fetchedAccounts);
    } catch (error) {
      toast.error("Failed to fetch customer accounts");
    }
  };

  const onSave = async (data) => {
    setIsLoading(true);
    console.log(data);
    try {
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Online Trasnfer</CardTitle>
        <p className="text-gray-400 text-sm text-secondary-foreground">
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                            {`${account.account_number} - Balance: Rs. ${account.balance}`}
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

            {isLoading ? (
              <LoadingButton className="w-full" />
            ) : (
              <Button type="submit" className="w-full">
                Make Transfer
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FundTransfer;
