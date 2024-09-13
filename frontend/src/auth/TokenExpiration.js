import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout, userExpiration } from "../api/UserApi";

const useTokenExpiration = () => {
    const navigate = useNavigate();

    const logoutUser = async () => {
        await logout();
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
        toast.warning("Session timedout!");
    };

    useEffect(() => {
        const logoutLogic = async () => {
            const { expirationTime } = await userExpiration();
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            if (timeUntilExpiration <= 0) {
                logoutUser(); // Token has already expired
            } else {
                // Set a timeout to log out the user when the token expires
                const timeoutId = setTimeout(() => {
                    logoutUser();
                }, timeUntilExpiration);

                // Clear the timeout if the component unmounts before the timer finishes
                return () => clearTimeout(timeoutId);
            }
        };

        logoutLogic();
    }, [navigate]);
};
export default useTokenExpiration;
