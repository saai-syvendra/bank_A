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
import UpdateDetailForm from "../forms/UpdateDetailForm";
import {
  callGetCustomerDetail,
  callUpdateCustomerDetail,
} from "../api/CustomerApi";
import CreateOnlineLoan from "../tabs/customer_tabs/CreateOnlineLoan";
import LoanPayment from "../tabs/customer_tabs/LoanPayment";
import CreateFd from "../tabs/customer_tabs/CreateFd";
import FundTransfer from "../tabs/customer_tabs/FundTransfer";

const CustomerDashboard = () => {
  const loading = useAuthorization(["customer"]);

  if (loading) {
    return <div></div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow-md">
        <div className="mb-5">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold mb-4">Customer Dashboard</h1>
            <LogoutButton />
          </div>
          <p>
            Welcome to your dashboard! Here you can manage your account and view
            your transactions.
          </p>
        </div>
        <Tabs defaultValue="view-transactions">
          <TabsList>
            <TabsTrigger value="view-transactions">
              View Transactions
            </TabsTrigger>
            <TabsTrigger value="create-loan">Create Loan</TabsTrigger>
            <TabsTrigger value="create-fd">Create FD</TabsTrigger>
            <TabsTrigger value="fund-transfer">Fund Transfer</TabsTrigger>
            <TabsTrigger value="update-details">Update Details</TabsTrigger>
            <TabsTrigger value="loan-payment">Loan Payment</TabsTrigger>
            <TabsTrigger value="atm">ATM</TabsTrigger>
            <TabsTrigger value="cdm">CDM</TabsTrigger>
          </TabsList>
          <TabsContent value="view-transactions">
            <ViewTransactions />
          </TabsContent>
          <TabsContent value="create-loan">
            <CreateOnlineLoan triggerToRefetch={true} />
          </TabsContent>
          <TabsContent value="create-fd">
            <CreateFd triggerToRefetch={true} />
          </TabsContent>
          <TabsContent value="fund-transfer">
            <FundTransfer triggerToRefetch={true} />
          </TabsContent>
          <TabsContent value="update-details">
            <UpdateDetailForm
              triggerUpdateDetails={true}
              fetchFucntion={callGetCustomerDetail}
              updateFunction={callUpdateCustomerDetail}
              employee={false}
            />
          </TabsContent>
          <TabsContent value="loan-payment">
            <LoanPayment />
          </TabsContent>
          <TabsContent value="atm">ATM</TabsContent>
          <TabsContent value="cdm">CDM</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
