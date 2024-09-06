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
import { z } from "zod";

const formSchema = z.object({
    customer: z.string().min(1, "Customer is required"),
    accountType: z.enum(["Checking", "Saving"]),
    plan: z.string().optional(),
    initialAmount: z.coerce.number().min(0),
});

const CreateAccountForm = ({
    onSave,
    isLoading,
    // currentUser,
    title = "Create New Account",
    buttonText = "Submit",
}) => {
    const [plans, setPlans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [minimumBalance, setMinimumBalance] = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customer: "",
            accountType: "Checking",
            plan: "",
            initialAmount: 0,
        },
    });

    const fetchPlans = async () => {
        // try {
        //     const response = await axios.get("/api/plans");
        //     setPlans(response.data);
        // } catch (error) {
        //     console.error("Failed to fetch plans", error);
        // }
        const plans = [
            {
                plan_id: "1",
                name: "Basic",
                interest: 5,
                minimum_balance: 1000,
            },
            {
                plan_id: "2",
                name: "Standard",
                interest: 6.0,
                minimum_balance: 5000,
            },
            {
                plan_id: "3",
                name: "Premium",
                interest: 7.5,
                minimum_balance: 10000,
            },
        ];
        setPlans(plans);
    };

    const fetchCustomers = async () => {
        // try {
        //     const response = await axios.get("/api/customers");
        //     setCustomers(response.data);
        // } catch (error) {
        //     console.error("Failed to fetch customers", error);
        // }
        const customers = [
            {
                customer_id: "1",
                first_name: "John",
                last_name: "Doe",
            },
            {
                customer_id: "2",
                first_name: "Jane",
                last_name: "Doe",
            },
            {
                customer_id: "3",
                first_name: "Alice",
                last_name: "Smith",
            },
            {
                customer_id: "4",
                first_name: "Bob",
                last_name: "Johnson",
            },
        ];
        setCustomers(customers);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (form.watch("accountType") === "Saving") {
            fetchPlans();
        }
    }, [form.watch("accountType")]);

    useEffect(() => {
        const selectedPlan = plans.find(
            (plan) => plan.plan_id === form.watch("plan")
        );
        if (selectedPlan) {
            setMinimumBalance(selectedPlan.minimum_balance);
            form.setValue("initialAmount", selectedPlan.minimum_balance);
        } else {
            setMinimumBalance(null);
        }
    }, [form.watch("plan"), plans, form]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSave)}
                className="space-y-4 bg-gray-50 rounded-lg md:p-10"
            >
                <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <FormDescription>
                        Fill out the form to create a new account
                    </FormDescription>
                </div>

                <div className="flex space-x-4">
                    <div className="w-3/4">
                        <FormField
                            control={form.control}
                            name="customer"
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
                                                    key={customer.customer_id}
                                                    value={customer.customer_id}
                                                >
                                                    {customer.first_name}
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
                                            <option value="Checking">
                                                Checking
                                            </option>
                                            <option value="Saving">
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

                {form.watch("accountType") === "Saving" && (
                    <FormField
                        control={form.control}
                        name="plan"
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
                                                {plan.name} - {plan.interest}%
                                                interest, Min Balance: $
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
                    name="initialAmount"
                    render={({ field }) => (
                        <FormItem>
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
                        {buttonText}
                    </Button>
                )}
            </form>
        </Form>
    );
};

export default CreateAccountForm;
