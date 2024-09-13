import React from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "../components/ui/tabs";
import ViewTransactions from "../tabs/customer_tabs/ViewTransactions";
import LogoutButton from "../components/LogoutButton";
import useAuthorization from "../auth/useAuthorization";

const CustomerDashboard = () => {
    const loading = useAuthorization(["customer"]);

    if (loading) {
        return <div></div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
                <div className="mb-5">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold mb-4">
                            Customer Dashboard
                        </h1>
                        <LogoutButton />
                    </div>
                    <p>
                        Welcome to your dashboard! Here you can manage your
                        account and view your transactions.
                    </p>
                </div>
                <Tabs defaultValue="view-transactions">
                    <TabsList>
                        <TabsTrigger value="view-transactions">
                            View Transactions
                        </TabsTrigger>
                        <TabsTrigger value="create-loan">
                            Create Loan
                        </TabsTrigger>
                        <TabsTrigger value="create-fd">Create FD</TabsTrigger>
                        <TabsTrigger value="func-trasfer">
                            Fund Transfer
                        </TabsTrigger>
                        <TabsTrigger value="update-details">
                            Update Details
                        </TabsTrigger>
                        <TabsTrigger value="loan-payment">
                            Loan Payment
                        </TabsTrigger>
                        <TabsTrigger value="atm">ATM</TabsTrigger>
                        <TabsTrigger value="cdm">CDM</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view-transactions">
                        <ViewTransactions />
                    </TabsContent>
                    <TabsContent value="create-loan">Create Loan</TabsContent>
                    <TabsContent value="create-fd">Create FD</TabsContent>
                    <TabsContent value="fund-trasfer">
                        Fund Transfer
                    </TabsContent>
                    <TabsContent value="update-details">
                        Update Details
                    </TabsContent>
                    <TabsContent value="loan-payment">Loan Payment</TabsContent>
                    <TabsContent value="atm">ATM</TabsContent>
                    <TabsContent value="cdm">CDM</TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default CustomerDashboard;
