import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { callCreateCustomer } from "../api/CustomerApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
    brc: z.string().length(6, "BRC must be 6 digits"),
    orgName: z.string().min(1, "Organisation name is required"),
    address: z.string().min(1, "Address is required"),
    telephone: z.string().length(10, "Telephone number must be 10 digits"),
    email: z.string().email("Invalid email"),
});

export default function CreateOrganisationForm() {
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
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    Create Organisation
                </CardTitle>
                {/* <FormDescription>
                    Fill out the form to create a new organisation
                </FormDescription> */}
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="orgName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Organisation Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BRC</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="telephone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telephone</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="tel" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="bg-white"
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isLoading ? (
                            <LoadingButton />
                        ) : (
                            <Button type="submit" className="w-full">
                                Create Organisation
                            </Button>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
