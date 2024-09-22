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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Update {employee ? "Employee" : "Customer"} Details
        </CardTitle>
        <p className="text-gray-400 text-sm text-secondary-foreground">
          Update relevant details below
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="nic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIC</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white" disabled />
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
                      <Input {...field} type="email" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
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
                    <Textarea {...field} className="bg-white" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {employee && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Experience (Years)</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isLoading ? (
              <LoadingButton />
            ) : (
              <Button type="submit" className="w-full">
                Update Details
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UpdateDetailForm;
