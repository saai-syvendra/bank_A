import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoutes";
import Dashboard from "./pages/Dashboard";
import LoginOtp from "./pages/LoginOtp";
import Machines from "./pages/Machines";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginOtp />} />
      <Route path="/machines" element={<Machines />} />
      <Route
        element={<ProtectedRoute roles={["employee", "manager", "customer"]} />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
