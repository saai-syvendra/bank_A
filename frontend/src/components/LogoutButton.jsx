import React from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/UserApi";
import "react-confirm-alert/src/react-confirm-alert.css";
import useTokenExpiration from "../auth/TokenExpiration";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { cancelTimeout } = useTokenExpiration();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("role");
    cancelTimeout();
    navigate("/login");
    toast.success("Logout successful!");
  };

  return (
    <>
      <Button
        onClick={setIsConfirmationOpen}
        className="bg-red-500 text-white hover:bg-red-600"
      >
        Logout
      </Button>

      <AlertDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want ot logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-blue-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-blue-900 hover:bg-teal-950">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogoutButton;
