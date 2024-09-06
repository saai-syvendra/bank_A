import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoutes";
import Dashboard from "./pages/Dashboard";
import LoginOtp from "./pages/LoginOtp";

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    // <HomePage />
                    <Navigate to="/login" />
                }
            />
            <Route
                path="/login"
                element={
                    // <Login />
                    <LoginOtp />
                }
            />
            <Route
                element={
                    <ProtectedRoute
                        roles={["employee", "manager", "customer"]}
                    />
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;
