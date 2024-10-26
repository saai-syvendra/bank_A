import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOTP } from "../auth/OtpContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const OTPDialog = ({ onVerificationSuccess }) => {
  const { showOtpDialog, setShowOtpDialog, verifyOtp, isVerifying } = useOTP();

  const form = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data) => {
    const isValid = await verifyOtp(data.otp);
    form.reset();
    if (isValid) {
      onVerificationSuccess();
    }
  };

  const onClose = () => {
    toast.error("OTP verification cancelled.");
  };

  return (
    <AlertDialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-blue-900">Verify OTP</AlertDialogTitle>
          <AlertDialogDescription className="text-teal-600">
            Please enter the OTP sent to your registered email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        {[...Array(6)].map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    The OTP will expire in <OtpCountdown initialSeconds={300} />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onClose} className="hover:bg-blue-50">Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit" disabled={isVerifying} className="bg-blue-900 hover:bg-teal-950">
                Verfiy OTP
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export function OtpCountdown({ initialSeconds }) {
  const [seconds, setSeconds] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <span>
      {minutes}:{remainingSeconds.toString().padStart(2, "0")}
    </span>
  );
}
