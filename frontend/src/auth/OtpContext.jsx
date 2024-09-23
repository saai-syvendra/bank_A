import React, { createContext, useState, useContext, useCallback } from "react";
import { toast } from "sonner";
import { callSendOtp, callVerifyOtp } from "../api/UserApi";

const OTPContext = createContext(undefined);

export const useOTP = () => {
  const context = useContext(OTPContext);
  if (!context) {
    throw new Error("useOTP must be used within an OTPProvider");
  }
  return context;
};

export const OTPProvider = ({ children }) => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  const sendOtp = useCallback(async () => {
    setIsVerifying(true);
    try {
      // Replace this with your actual OTP sending API call
      await callSendOtp("login");
      setIsOtpSent(true);
      setShowOtpDialog(true);
      toast.success("OTP sent successfully");
    } catch (error) {
      toast.error("Failed to send OTP");
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const verifyOtp = useCallback(async (otp) => {
    setIsVerifying(true);
    try {
      // Replace this with your actual OTP verification API call
      await callVerifyOtp(otp);
      toast.success("OTP verified successfully");
      setShowOtpDialog(false);
      return true;
    } catch (error) {
      toast.error("OTP verification failed");
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return (
    <OTPContext.Provider
      value={{
        isOtpSent,
        isVerifying,
        showOtpDialog,
        sendOtp,
        verifyOtp,
        setShowOtpDialog,
      }}
    >
      {children}
    </OTPContext.Provider>
  );
};
