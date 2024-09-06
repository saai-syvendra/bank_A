import React from "react";
import CustomerDashboard from "./CustomerDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import useTokenExpiration from "../auth/TokenExpiration";
import AdminDashboard from "./AdminDashboard";
import { logout } from "../api/UserApi";

const Dashboard = () => {
    useTokenExpiration();
    const role = localStorage.getItem("role");
    if (role === "customer") {
        return <CustomerDashboard />;
    } else if (["employee", "manager"].includes(role)) {
        return <EmployeeDashboard />;
    } else if (role === "admin") {
        return <AdminDashboard />;
    }
};

export default Dashboard;
