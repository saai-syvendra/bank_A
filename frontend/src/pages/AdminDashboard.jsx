import React from "react";
import useAuthorization from "../auth/useAuthorization";

const AdminDashboard = () => {
  const loading = useAuthorization(["admin"]);

  if (loading) {
    return <div></div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p>
          Welcome to the admin dashboard. Here you can manage your tasks and
          view customer information.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
