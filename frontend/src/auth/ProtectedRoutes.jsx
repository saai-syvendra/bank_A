import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { verifyRole } from "../api/UserApi";

const ProtectedRoute = ({ roles }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthorization = async () => {
            try {
                await verifyRole(roles);
                setIsAuthorized(true);
            } catch (error) {
                toast.error(error.message);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthorization();
    }, [roles]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
