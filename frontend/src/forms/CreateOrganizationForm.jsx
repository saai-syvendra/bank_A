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
    brc: z.string().length(6, "BRC must be 6 digits"),
    orgName: z.string().min(1, "Organisation name is required"),
    address: z.string().min(1, "Address is required"),
    telephone: z.string().length(10, "Telephone number must be 10 digits"),
    email: z.string().email("Invalid email"),
});

const CreateOrganisationForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            brc: "",
            orgName: "",
            address: "",
            telephone: "",
            email: "",
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await callCreateCustomer("organisation", data);
            toast.success("Organisation created successfully");
            form.reset();
        } catch (errors) {
            toast.error("Organisation creation failed");
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
                <h2 className="text-2xl font-bold">Create Organisation</h2>

                <div className="flex space-x-5">
                    {/* Organisation Name */}
                    <FormField
                        control={form.control}
                        name="orgName"
                        render={({ field }) => (
                            <FormItem className="w-2/5">
                                <FormLabel>Organisation Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Telephone */}
                    <FormField
                        control={form.control}
                        name="telephone"
                        render={({ field }) => (
                            <FormItem className="w-2/5">
                                <FormLabel>Telephone</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* BRC */}
                    <FormField
                        control={form.control}
                        name="brc"
                        render={({ field }) => (
                            <FormItem className="w-1/5">
                                <FormLabel>BRC</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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

                <div className="flex space-x-5">
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
                </div>

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

export default CreateOrganisationForm;
