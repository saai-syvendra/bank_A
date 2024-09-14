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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { callCreateCustomer } from "../api/CustomerApi";
import { toast } from "sonner";

const formSchema = z.object({
    nic: z.string().length(12, "NIC must be 12 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    mobile: z.string().length(10, "Invalid mobile number"),
    email: z.string().email("Invalid email"),
    dob: z.string().nonempty("Date of birth is required"),
    address: z.string().min(1, "Address is required"),
});

const CreateIndividualForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nic: "",
            firstName: "",
            lastName: "",
            mobile: "",
            email: "",
            dob: "",
            address: "",
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await callCreateCustomer("individual", data);
            toast.success("Customer created successfully");
            form.reset();
        } catch (errors) {
            toast.error("Customer creation failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 bg-gray-50 rounded-lg p-6"
            >
                <h2 className="text-2xl font-bold">Create Person</h2>

                <div className="flex space-x-5">
                    {/* First Name */}
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem className="w-2/5">
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Last Name */}
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem className="w-2/5">
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* NIC */}
                    <FormField
                        control={form.control}
                        name="nic"
                        render={({ field }) => (
                            <FormItem className="w-1/5">
                                <FormLabel>NIC</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex space-x-5">
                    {/* Mobile */}
                    <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                            <FormItem className="w-2/5">
                                <FormLabel>Mobile</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-2/5">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Date of Birth */}
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem className="w-1/5">
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="date"
                                        className="bg-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex space-x-5"></div>

                {/* Address */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
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

export default CreateIndividualForm;
