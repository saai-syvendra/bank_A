import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout, userExpiration } from "../api/UserApi";

const useTokenExpiration = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const logoutUser = async () => {
    await logout();
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
    toast.warning("Session timed out!");
  };

  useEffect(() => {
    const logoutLogic = async () => {
      const { expirationTime } = await userExpiration();
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Set a new timeout to log out the user when the token expires
      timeoutRef.current = setTimeout(() => {
        logoutUser();
      }, timeUntilExpiration);
    };

    logoutLogic();

    // Cleanup function to clear the timeout on unmount or before setting a new one
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const cancelTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      clearTimeout(timeoutRef.current - 1);
      timeoutRef.current = null; // Clear the reference
    }
  };

  return { cancelTimeout };
};

export default useTokenExpiration;
