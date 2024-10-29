import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authenticateUser, login, loginOtp } from "../api/UserApi";
import OtpForm from "../forms/otpForm";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  username: z.string().email("Invalid username"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginOtp() {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    const authenticate = async () => {
      try {
        await authenticateUser();
        navigate("/dashboard");
      } catch (error) {
        // User not logged in, do nothing
      }
    };

    authenticate();
  }, [otpVerified, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await login(data.username, data.password);

      if (response.message === "OTP Sent") {
        setOtpSent(true);
        toast.success("OTP sent to your email!");
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setIsLoading(true);
    try {
      const response = await loginOtp(otp);
      localStorage.setItem("role", response.role);
      setOtpVerified(true);
      navigate("/dashboard");
      toast.success("Login successful!");
    } catch (error) {
      console.error("Error:", error.message);
      if (error.message === "OTP expired") {
        toast.error("OTP expired! Try again!");
        form.reset();
        setIncorrectCount(0);
        setOtpSent(false);
      } else if (incorrectCount >= 2) {
        toast.error("OTP verification failed 3 times! Login again!");
        form.reset();
        setIncorrectCount(0);
        setOtpSent(false);
      } else if (error.message === "OTP incorrect") {
        setIncorrectCount(incorrectCount + 1);
        toast.error("OTP incorrect! Try again!");
      } else if (error.message === "OTP not found") {
        toast.error("Internal error! Try again!");
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('pedro-lastra-Nyvq2juw4_o-unsplash.jpg')" }}
    >
      {otpSent ? (
        <OtpForm onSubmit={handleOtpSubmit} isLoading={isLoading} />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-900">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  type="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isLoading ? (
                  <LoadingButton className="w-full" />
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-blue-900 hover:bg-teal-950"
                    disabled={isLoading}
                  >
                    Submit
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
