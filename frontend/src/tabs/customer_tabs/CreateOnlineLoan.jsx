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
    FormDescription,
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
import { callCreateOnlineLoan, callGetLoanPlans } from "../../api/LoanApi";
import { callGetCustomerFds } from "../../api/FdApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { callGetCustomerNames } from "../../api/CustomerApi";
import { callGetThisCustomerAccounts } from "../../api/AccountApi";

const formSchema = z.object({
    planId: z.coerce.number().min(1, "Please select a plan"),
    fdId: z.coerce.number().min(1, "Please select a fixed deposit"),
    connectedAccount: z.coerce.number().min(1, "Please select an account"),
    loanAmount: z.coerce.number().min(0, "Loan amount must be greater than 0"),
});

const CreateOnlineLoan = ({ triggerToRefetch }) => {
    const [plans, setPlans] = useState([]);
    const [fds, setFds] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            planId: "",
            fdId: "",
            connectedAccount: "",
            loanAmount: 0,
        },
    });

    const fetchPlans = async () => {
        try {
            const fetchedPlans = await callGetLoanPlans();
            setPlans(fetchedPlans);
            console.log("Plans", fetchedPlans);
        } catch (error) {
            toast.error("Failed to fetch loan plans");
        }
    };

    const fetchFds = async () => {
        try {
            const fetchedFds = await callGetCustomerFds();
            setFds(fetchedFds);
            console.log("Fds", fetchedFds);
        } catch (error) {
            toast.error(
                error.message || "Failed to fetch customer fixed deposits"
            );
        }
    };

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
            await callCreateOnlineLoan(data);
            toast.success("Loan request submitted successfully");
            form.reset({
                planId: "",
                fdId: "",
                connectedAccount: "",
                loanAmount: 0,
            });
        } catch (error) {
            console.log(error);
            toast.error(error.message || "Loan request submission failed");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (triggerToRefetch) {
            fetchFds();
            fetchAccounts();
            fetchPlans();
        }
    }, [triggerToRefetch]);

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    Create Loan Request
                </CardTitle>
                <p className="text-gray-400 text-sm text-secondary-foreground">
                    Fill out the form to submit a loan request
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSave)}
                        className="space-y-6"
                    >
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
                                                    <SelectValue placeholder="Select a loan plan" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {plans.map((plan) => (
                                                    <SelectItem
                                                        key={plan.plan_id}
                                                        value={plan.plan_id.toString()}
                                                    >
                                                        {`${plan.plan_name} - ${
                                                            plan.interest
                                                        }% , Max Amount: Rs. ${parseFloat(
                                                            plan.max_amount
                                                        ).toLocaleString()}`}
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
                                name="fdId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Connected FD</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a fixed deposit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {fds.map((fd) => (
                                                    <SelectItem
                                                        key={fd.fd_id}
                                                        value={fd.fd_id.toString()}
                                                    >
                                                        {`${
                                                            fd.fd_id
                                                        } - Amount: Rs. ${parseFloat(
                                                            fd.amount
                                                        ).toLocaleString()}`}
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
                                name="loanAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loan Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                min={0}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {isLoading ? (
                            <LoadingButton />
                        ) : (
                            <Button type="submit" className="w-full">
                                Submit Loan Request
                            </Button>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default CreateOnlineLoan;