import React from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
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

const GoToMachinesButton = () => {
  const navigate = useNavigate();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleGoToMachines = () => {
    navigate("/machines");
    toast.success("Redirecting to Machines!");
  };

  return (
    <>
      <Button
        onClick={() => setIsConfirmationOpen(true)}
        className="bg-blue-900 text-white hover:bg-teal-950"
      >
        Go to Machines
      </Button>

      <AlertDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Navigation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to go to the Machines page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-blue-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToMachines} className="bg-blue-900 hover:bg-teal-950">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GoToMachinesButton;