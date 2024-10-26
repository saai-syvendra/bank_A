import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarRail,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  Users,
  UserPlus,
  CreditCard,
  PiggyBank,
  UserCog,
  CheckSquare,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import ViewBranchTransactions from "../tabs/manager_tabs/ViewBranchTransactions";
import CreateAccountForm from "../forms/createAccountForm";
import LogoutButton from "../components/LogoutButton";
import useAuthorization from "../auth/useAuthorization";
import UpdateDetailForm from "../forms/UpdateDetailForm";
import {
  callGetEmployeeDetail,
  callUpdateEmployeeDetail,
} from "../api/EmployeeApi";
import CreateLoan from "../tabs/employee_tabs/CreateLoan";
import LoanApprovalList from "../tabs/manager_tabs/LoanApproval";
import EmployeeCashDepositForm from "../forms/EmployeeCashDepositForm";
import LateLoanInstallments from "../tabs/manager_tabs/LateLoanInstallments";
import CreateIndividualForm from "../forms/CreateIndividualForm";
import CreateOrganisationForm from "../forms/CreateOrganizationForm";
import Employee_Summary from "../tabs/employee_tabs/Employee_Summary";

const EmployeeDashboard = ({ role }) => {
  const loading = useAuthorization(["manager", "employee"]);
  const [activeTab, setActiveTab] = useState("create-ind-account");

  const isEmployee = role === "employee";

  if (loading) {
    return <div></div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "create-ind-account":
        return <CreateAccountForm triggerFetchCustomers={true} individualCustomer={true}/>;
      case "create-org-account":
        return <CreateAccountForm triggerFetchCustomers={true} individualCustomer={false}/>;
      case "create-ind-customer":
        return <CreateIndividualForm/>;
      case "create-org-customer":
        return <CreateOrganisationForm/>;
      case "create-loan":
        return <CreateLoan triggerFetchCustomers={true} />;
      case "cash-deposit":
        return <EmployeeCashDepositForm />;
      case "update-details":
        return (
          <UpdateDetailForm
            triggerUpdateDetails={true}
            fetchFucntion={callGetEmployeeDetail}
            updateFunction={callUpdateEmployeeDetail}
            employee={true}
          />
        );
      case "approve-loan":
        return <LoanApprovalList />;
      case "late-loan":
        return <LateLoanInstallments />;
      case "transactions":
        return <ViewBranchTransactions />;
        case "summary":
          return <Employee_Summary/>;
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-gray-100">
      <SidebarProvider>
        <Sidebar className="w-64" collapsible="coll">
          <SidebarHeader>
            <h1 className="text-xl font-bold p-4 text-stone-950">
              {isEmployee ? "Employee" : "Manager"} Dashboard
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
                <SidebarMenuButton onClick={() => setActiveTab("summary")}>
                  <CreditCard className="mr-2" />
                  Summary
                </SidebarMenuButton>
              <SidebarMenuItem>
                <SidebarMenuButton className="cursor-text">
                  <Users className="mr-2" />
                  Create Account
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton onClick={() => setActiveTab("create-ind-account")} className="cursor-pointer">
                      Create Individual Account
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton onClick={() => setActiveTab("create-org-account")} className="cursor-pointer">
                      Create Organisation Account
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="cursor-text">
                  <UserPlus className="mr-2" />
                  Create Customer
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton onClick={() => setActiveTab("create-ind-customer")} className="cursor-pointer">
                      Create Individual Customer
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton onClick={() => setActiveTab("create-org-customer")} className="cursor-pointer">
                      Create Organisation Customer
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("create-loan")}>
                  <CreditCard className="mr-2" />
                  Create Loan
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("cash-deposit")}>
                  <PiggyBank className="mr-2" />
                  Cash Deposit
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("update-details")}>
                  <UserCog className="mr-2" />
                  Update Details
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isEmployee && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("approve-loan")}>
                      <CheckSquare className="mr-2" />
                      Approve Loan
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("late-loan")}>
                      <AlertCircle className="mr-2" />
                      Late Loan Installments
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("transactions")}>
                      <BarChart3 className="mr-2" />
                      Transactions
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
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

export default EmployeeDashboard;