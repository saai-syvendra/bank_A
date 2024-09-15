import React from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/UserApi";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import useTokenExpiration from "../auth/TokenExpiration";

const LogoutButton = () => {
    const navigate = useNavigate();
    const { cancelTimeout } = useTokenExpiration();

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem("role");
        cancelTimeout();
        navigate("/login");
        toast.success("Logout successful!");
    };

    const confirmLogout = () => {
        confirmAlert({
            title: "Confirm Logout",
            message: "Are you sure you want to logout?",
            buttons: [
                {
                    label: "Yes",
                    onClick: handleLogout,
                    className: "bg-red-500 text-white hover:bg-red-600",
                },
                {
                    label: "No",
                    className: "bg-green-500 text-white hover:bg-green-600",
                },
            ],
        });
    };

    return (
        <Button
            onClick={confirmLogout}
            className="bg-red-500 text-white hover:bg-red-600"
        >
            Logout
        </Button>
    );
};

export default LogoutButton;
