import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  UserCog,
  DollarSign,
  LogOut,
} from "lucide-react";
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
import Summary from "../tabs/customer_tabs/Summary";

const CustomerDashboard = () => {
  const loading = useAuthorization(["customer"]);
  const [activeTab, setActiveTab] = useState("summary");

  if (loading) {
    return <div></div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "summary":
        return <Summary />;
      case "view-transactions":
        return <ViewTransactions />;
      case "create-loan":
        return <CreateOnlineLoan triggerToRefetch={true} />;
      case "create-fd":
        return <CreateFd triggerToRefetch={true} />;
      case "fund-transfer":
        return <FundTransfer triggerToRefetch={true} />;
      case "update-details":
        return (
          <UpdateDetailForm
            triggerUpdateDetails={true}
            fetchFucntion={callGetCustomerDetail}
            updateFunction={callUpdateCustomerDetail}
            employee={false}
          />
        );
      case "loan-payment":
        return <LoanPayment />;
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-gray-100">
      <SidebarProvider>
        <Sidebar className="w-64">
          <SidebarHeader>
            <h1 className="text-xl font-bold p-4 text-stone-950">Customer Dashboard</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("summary")}>
                  <LayoutDashboard className="mr-2" />
                  Summary
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("view-transactions")}>
                  <FileText className="mr-2" />
                  View Transactions
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("create-loan")}>
                  <CreditCard className="mr-2" />
                  Create Loan
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("create-fd")}>
                  <Banknote className="mr-2" />
                  Create FD
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("fund-transfer")}>
                  <ArrowLeftRight className="mr-2" />
                  Fund Transfer
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("loan-payment")}>
                  <DollarSign className="mr-2" />
                  Loan Payment
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("update-details")}>
                  <UserCog className="mr-2" />
                  Update Details
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <LogoutButton />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </SidebarProvider>
    </div>
  );
};

export default CustomerDashboard;