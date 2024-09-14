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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const employeeFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    mobile: z.string().length(10, "Invalid mobile number"),
    address: z.string().min(1, "Address is required"),
    position: z.string().min(1, "Position is required"),
    experience: z.string().min(1, "Experience is requried"),
    nic: z.string().length(12, "Invalid nic number"),
    dob: z.string().nonempty("Date of birth is required"),
    email: z.string().email("Invalid email"),
});

const customerFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    mobile: z.string().length(10, "Invalid mobile number"),
    address: z.string().min(1, "Address is required"),
    nic: z.string().length(12, "Invalid nic number"),
    dob: z.string().nonempty("Date of birth is required"),
    email: z.string().email("Invalid email"),
});

const UpdateDetailForm = ({
    triggerUpdateDetails,
    fetchFucntion,
    updateFunction,
    employee = true,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const formSchema = employee ? employeeFormSchema : customerFormSchema;
    const form = useForm({
        resolver: zodResolver(formSchema),
    });

    const fetchEmployeeDetail = async () => {
        try {
            const data = await fetchFucntion();
            form.reset(data);
            form.setValue(
                "dob",
                new Date(data.dob).toDateString().split(" ").slice(1).join(" ")
            );
        } catch (error) {
            toast.error("Failed to fetch employee detail");
        }
    };

    useEffect(() => {
        if (triggerUpdateDetails) {
            fetchEmployeeDetail();
        }
    }, [triggerUpdateDetails]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        data.dob = new Date(data.dob).toISOString().split("T")[0];
        console.log(data);
        try {
            await updateFunction(data);
            toast.success("Details updated successfully");
        } catch (errors) {
            toast.error("Update failed");
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
                <h2 className="text-2xl font-bold">Update Details</h2>

                <div className="flex space-x-5">
                    {/* NIC */}
                    <FormField
                        control={form.control}
                        name="nic"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>NIC</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="bg-white"
                                        disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* DOB */}
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="bg-white"
                                        disabled
                                    />
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
                            <FormItem className="w-1/3">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="bg-white"
                                        disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex space-x-5">
                    {/* First Name */}
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
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
                            <FormItem className="w-1/3">
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Mobile */}
                    <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>Mobile</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex space-x-5">
                    {/* Address */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className={employee ? "w-1/2" : "w-full"}>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {employee && (
                        <>
                            {/* Experience */}
                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                    <FormItem className="w-1/3">
                                        <FormLabel>
                                            Experience (Years)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="bg-white"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Position */}
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem className="w-1/6">
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="bg-white"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>

                {isLoading ? (
                    <LoadingButton />
                ) : (
                    <Button type="submit" className="bg-orange-500">
                        Update
                    </Button>
                )}
            </form>
        </Form>
    );
};

export default UpdateDetailForm;
