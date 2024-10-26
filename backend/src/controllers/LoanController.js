import LoanModel from "../models/LoanModel.js";
import CustomerModel from "../models/CustomerModel.js";
import AccountModel from "../models/AccountModel.js";
import EmployeeModel from "../models/EmployeeModel.js";

const createLoan = async (req, res) => {
  const { planId, customerId, connectedAccount, loanAmount, reason } = req.body;

  try {
    await LoanModel.createLoan(
      planId,
      customerId,
      connectedAccount,
      loanAmount,
      reason
    );
    res.status(201).json({ message: "Loan created successfully!" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const createOnlineLoan = async (req, res) => {
  const { id: customerId } = req.user;
  const { planId, fdId, connectedAccount, loanAmount } = req.body;
  try {
    await LoanModel.createOnlineLoan(
      planId,
      customerId,
      fdId,
      connectedAccount,
      loanAmount
    );
    res.status(201).send({ message: "Online loan created successfully!" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const getLoanPlans = async (req, res) => {
  try {
    const plans = await LoanModel.getLoanPlans();
    res.status(200).send(plans);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getApprovalPendingLoans = async (req, res) => {
  try {
    const { id: employeeId } = req.user;
    const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
    const loans = await LoanModel.getApprovalPendingLoans();
    const loanData = [];
    for (const loan of loans) {
      const account = await AccountModel.getAccountById(loan.connected_account);
      if (account.branch_code === branchCode) {
        const customer = await CustomerModel.getCustomer(account.customer_id);
        const plan = await LoanModel.getPlan(loan.plan_id);
        let customer_name = "";
        if (customer["c_type"] === "individual") {
          customer_name = customer["first_name"] + " " + customer["last_name"];
        } else if (customer["c_type"] === "organisation") {
          customer_name = customer["org_name"];
        }
        loanData.push({
          ...loan,
          customer_name: customer_name,
          account_balance: account.balance,
          account_number: account.account_number,
          plan_name: plan.plan_name,
          plan_interest: plan.interest,
        });
      }
    }

    res.status(200).send(loanData);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const approveLoan = async (req, res) => {
  const { loanId } = req.body;
  try {
    await LoanModel.approveLoan(loanId);
    res.status(200).send({ message: "Loan approved successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const rejectLoan = async (req, res) => {
  const { loanId } = req.body;
  try {
    await LoanModel.rejectLoan(loanId);
    res.status(200).send({ message: "Loan rejected successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getUpcomingInstallments = async (req, res) => {
  const { id: customerId } = req.user;
  try {
    const installments = await LoanModel.getUpcomingInstallments(customerId);
    res.status(200).send(installments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const payInstallment = async (req, res) => {
  const { loanId, installmentNo, accountId } = req.body;
  try {
    await LoanModel.payInstallment(loanId, installmentNo, accountId);
    res.status(200).send({ message: "Installment paid successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getLateLoanInstallments = async (req, res) => {
  const { id: employeeId } = req.user;
  const branch_code = await EmployeeModel.getEmployeeBranch(employeeId);
  const { minAmount, maxAmount, customerId, startDate, endDate } = req.query;

  // If any of the above is undefined, set it to null
  const filters = {
    branch_code: branch_code,
    min_amount: minAmount || null,
    max_amount: maxAmount || null,
    customer_id: customerId || null,
    start_date: startDate || null,
    end_date: endDate || null,
  };
  try {
    const installments = await LoanModel.getLateLoanInstallments(filters);
    res.status(200).send(installments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getLoanCustomers = async (req, res) => {
  const { id: employeeId } = req.user;
  const branch_code = await EmployeeModel.getEmployeeBranch(employeeId);
  try {
    const customers = await LoanModel.getLoanCustomers(branch_code);
    res.status(200).send(customers);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
const getLoansForThisAccount = async (req, res) => {
  const { accountId } = req.query;
  try {
    const loans = await LoanModel.getLoansByAccountId(accountId);
    return res.json({ loans }); // Wrap loans in an array, even if it's a single object
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getBranchLoanSummary = async (req, res) => {
  const { id: employeeId } = req.user;
  const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
  try {
    const summary = await LoanModel.getBranchLoanSummary(branchCode);
    res.status(200).send(summary);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

export default {
  createLoan,
  createOnlineLoan,
  getLoanPlans,
  getApprovalPendingLoans,
  approveLoan,
  rejectLoan,
  getUpcomingInstallments,
  payInstallment,
  getLateLoanInstallments,
  getLoanCustomers,
  getLoansForThisAccount,
  getBranchLoanSummary
};
