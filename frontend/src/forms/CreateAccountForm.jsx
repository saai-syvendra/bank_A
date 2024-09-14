import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
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
import { custom, z } from "zod";
import { callCreateAccount, callGetSavingPlans } from "../api/AccountApi";
import { callGetCustomerNames } from "../api/CustomerApi";
import { toast } from "sonner";

const formSchema = z.object({
    customerId: z.coerce.number().min(10000),
    accountType: z.enum(["checking", "saving"]),
    planId: z.coerce.number().min(0),
    balance: z.coerce.number().min(0),
});

const CreateAccountForm = ({ triggerFetchCustomers }) => {
    const [plans, setPlans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [minimumBalance, setMinimumBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerId: 0,
            accountType: "checking",
            planId: 0,
            balance: 0,
        },
    });

    const fetchPlans = async () => {
        const plans = await callGetSavingPlans();
        setPlans(plans);
    };

    const fetchCustomers = async () => {
        const customers = await callGetCustomerNames();
        setCustomers(customers);
    };

    const onSave = async (data) => {
        setIsLoading(true);
        if (data.accountType === "checking") {
            data.planId = null;
        } else {
            if (data.planId === "") {
                toast.error("Please select a plan");
                return;
            }
        }
        console.log(data);
        try {
            await callCreateAccount(data);
            toast.success("Account created successfully");
            form.reset();
        } catch (error) {
            toast.error(error.message);
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
            form.setValue("plan", 0);
            form.setValue("balance", 0);
        }
    }, [form.watch("accountType")]);

    useEffect(() => {
        const selectedPlan = plans.find(
            (plan) => plan.plan_id == form.watch("planId")
        );
        if (selectedPlan) {
            setMinimumBalance(selectedPlan.minimum_balance);
            form.setValue("balance", selectedPlan.minimum_balance);
        } else {
            setMinimumBalance(0);
        }
    }, [form.watch("planId"), plans, form]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSave)}
                className="space-y-4 bg-gray-50 rounded-lg md:p-10"
            >
                <div>
                    <h2 className="text-2xl font-bold">Create Account Form</h2>
                    <FormDescription>
                        Fill out the form to create a new account
                    </FormDescription>
                </div>

                <div className="flex space-x-4">
                    <div className="w-3/4">
                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="bg-white border rounded p-2 w-full"
                                        >
                                            <option value="">
                                                Select a customer
                                            </option>
                                            {customers.map((customer) => (
                                                <option
                                                    key={customer.customerId}
                                                    value={customer.customerId}
                                                >
                                                    {customer.customerId}{" "}
                                                    {" - "} {customer.name}{" "}
                                                    {" - "}{" "}
                                                    {customer.customerType}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="w-1/4">
                        <FormField
                            control={form.control}
                            name="accountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Type</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="bg-white border rounded p-2 w-full"
                                        >
                                            <option value="checking">
                                                Checking
                                            </option>
                                            <option value="saving">
                                                Saving
                                            </option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {form.watch("accountType") === "saving" && (
                    <FormField
                        control={form.control}
                        name="planId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan</FormLabel>
                                <FormControl>
                                    <select
                                        {...field}
                                        className="bg-white border rounded p-2 w-full"
                                    >
                                        <option value="">Select a plan</option>
                                        {plans.map((plan) => (
                                            <option
                                                key={plan.plan_id}
                                                value={plan.plan_id}
                                            >
                                                {plan.plan_name} -{" "}
                                                {plan.interest}% interest, Min
                                                Balance: Rs.
                                                {plan.minimum_balance}
                                            </option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="balance"
                    render={({ field }) => (
                        <FormItem className="w-1/4">
                            <FormLabel>Initial Amount</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="bg-white"
                                    // disabled={
                                    //     form.watch("accountType") ===
                                    //         "Saving" && minimumBalance !== null
                                    // }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isLoading ? (
                    <LoadingButton />
                ) : (
                    <Button type="submit" className="bg-orange-500">
                        Submit
                    </Button>
                )}
            </form>
        </Form>
    );
};

export default CreateAccountForm;
