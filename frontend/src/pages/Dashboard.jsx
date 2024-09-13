import React from "react";
import CustomerDashboard from "./CustomerDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import useTokenExpiration from "../auth/TokenExpiration";
import AdminDashboard from "./AdminDashboard";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/UserApi";
import { toast } from "sonner";

const Dashboard = () => {
    useTokenExpiration();
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem("role");
        navigate("/login");
        toast.error("Login again");
    };

    if (role === "customer") {
        return <CustomerDashboard />;
    } else if (["employee", "manager"].includes(role)) {
        return <EmployeeDashboard />;
    } else if (role === "admin") {
        return <AdminDashboard />;
    } else {
        // User removed role from localStorage
        handleLogout();
    }
};

export default Dashboard;
