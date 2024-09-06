// src/EmployeeDashboard.jsx
import React from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "../components/ui/tabs";
import ViewBranchTransactions from "../tabs/employee_tabs/ViewBranchTransactions";
import CreateAccountForm from "../forms/CreateAccountForm";
import LogoutButton from "../components/LogoutButton";
const EmployeeDashboard = () => {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Employee Dashboard</h1>
                    <LogoutButton />
                </div>
                <p>
                    Welcome to the employee dashboard. Here you can manage your
                    tasks and view customer information.
                </p>
                <Tabs defaultValue="create-account" className="w-80%">
                    <TabsList>
                        <TabsTrigger value="create-account">
                            Create Account
                        </TabsTrigger>
                        <TabsTrigger value="create-customer">
                            Create Customer
                        </TabsTrigger>
                        <TabsTrigger value="create-loan">
                            Create Loan
                        </TabsTrigger>
                        <TabsTrigger value="transactions">
                            Transactions
                        </TabsTrigger>
                        <TabsTrigger value="cash-deposit">
                            Cash Deposit
                        </TabsTrigger>
                        <TabsTrigger value="update-details">
                            Update Details
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="create-account">
                        <CreateAccountForm />
                    </TabsContent>
                    <TabsContent value="create-customer">
                        Create Customer
                    </TabsContent>
                    <TabsContent value="create-loan">Create Loan</TabsContent>
                    <TabsContent value="transactions">
                        <ViewBranchTransactions />
                    </TabsContent>
                    <TabsContent value="cash-deposit">Cash Deposit</TabsContent>
                    <TabsContent value="update-details">
                        Update Details
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
