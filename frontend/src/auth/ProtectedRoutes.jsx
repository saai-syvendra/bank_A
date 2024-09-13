import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { logout, verifyRole } from "../api/UserApi";

const ProtectedRoute = ({ roles }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthorization = async () => {
            try {
                await verifyRole(roles);
                setIsAuthorized(true);
            } catch (error) {
                if (error.message === "OTP verification needed") {
                    await logout();
                }
                toast.error(error.message);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthorization();
    }, [roles]);

    if (loading) {
        return <div></div>;
    }

    return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
