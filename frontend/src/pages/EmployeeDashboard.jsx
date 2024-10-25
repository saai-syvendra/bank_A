import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import ViewBranchTransactions from "../tabs/employee_tabs/ViewBranchTransactions";
import Transactions from "../tabs/manager_tabs/Transactions"
import CreateAccount from "../tabs/employee_tabs/CreateAccount";
import LogoutButton from "../components/LogoutButton";
import useAuthorization from "../auth/useAuthorization";
import CreateCustomer from "../tabs/employee_tabs/CreateCustomer";
import UpdateDetailForm from "../forms/UpdateDetailForm";
import {
  callGetEmployeeDetail,
  callUpdateEmployeeDetail,
} from "../api/EmployeeApi";
import CreateLoan from "../tabs/employee_tabs/CreateLoan";
import LoanApprovalList from "../tabs/manager_tabs/LoanApproval";
import EmployeeCashDepositForm from "../forms/EmployeeCashDepositForm";
import LateLoanInstallments from "../tabs/manager_tabs/LateLoanInstallments";

const EmployeeDashboard = ({ role }) => {
  const loading = useAuthorization(["manager", "employee"]);

  const isEmployee = role === "employee";

  if (loading) {
    return <div></div>;
  }
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className={`max-w-5xl mx-auto bg-white p-6 rounded shadow-md`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            {isEmployee ? "Employee" : "Manager"} Dashboard
          </h1>
          <LogoutButton />
        </div>
        <p>
          Welcome to the {isEmployee ? "employee" : "manager"} dashboard. Here
          you can manage your tasks and view customer information.
        </p>
        <Tabs defaultValue="create-account" className="w-80%">
          <TabsList>
            <TabsTrigger value="create-account">Create Account</TabsTrigger>
            <TabsTrigger value="create-customer">Create Customer</TabsTrigger>
            <TabsTrigger value="create-loan">Create Loan</TabsTrigger>
            <TabsTrigger value="cash-deposit">Cash Deposit</TabsTrigger>
            <TabsTrigger value="update-details">Update Details</TabsTrigger>
            {!isEmployee && (
              <>
                <TabsTrigger value="approve-loan">Approve Loan</TabsTrigger>
                <TabsTrigger value="late-loan">
                  Late Loan Installments
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  Transactions
                </TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent value="create-account">
            <CreateAccount triggerFetchCustomers={true} />
          </TabsContent>
          <TabsContent value="create-customer">
            <CreateCustomer />
          </TabsContent>
          <TabsContent value="create-loan">
            <CreateLoan triggerFetchCustomers={true} />
          </TabsContent>
          <TabsContent value="cash-deposit">
            <EmployeeCashDepositForm />
          </TabsContent>
          <TabsContent value="update-details">
            <UpdateDetailForm
              triggerUpdateDetails={true}
              fetchFucntion={callGetEmployeeDetail}
              updateFunction={callUpdateEmployeeDetail}
              employee={true}
            />
          </TabsContent>
          {!isEmployee && (
            <>
              <TabsContent value="approve-loan">
                <LoanApprovalList />
              </TabsContent>
              <TabsContent value="late-loan">
                <LateLoanInstallments />
              </TabsContent>
              <TabsContent value="transactions">
                <Transactions/>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
