import { useState, useEffect } from "react";
import { logout, verifyRole } from "../api/UserApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const useAuthorization = (roles = []) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthorization = async () => {
            try {
                await verifyRole(roles);
            } catch (error) {
                localStorage.removeItem("role");
                await logout();
                navigate("/login");
                toast.error("Access denied. Login again");
            } finally {
                setLoading(false);
            }
        };

        checkAuthorization();
    }, [roles, navigate]);

    return loading;
};

export default useAuthorization;
