import AccountModel from "../models/AccountModel.js";
import EmployeeModel from "../models/EmployeeModel.js";

const getCustomerAccounts = async (req, res) => {
  const { customerId } = req.params;
  try {
    const accounts = await AccountModel.getCustomerAccounts(customerId);
    return res.json(accounts);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const getThisCustomerAccounts = async (req, res) => {
  const { id: customerId } = req.user;
  const { accountType } = req.query;
  try {
    const accounts = await AccountModel.getCustomerAccounts(
      customerId,
      accountType
    );
    return res.json(accounts);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const createAccount = async (req, res) => {
  const { planId, customerId, balance, accountType } = req.body;
  const branchCode = await EmployeeModel.getEmployeeBranch(req.user.id);
  try {
    await AccountModel.createAccount(
      planId,
      branchCode,
      customerId,
      balance,
      accountType
    );
    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const getSavingPlans = async (req, res) => {
  try {
    const plans = await AccountModel.getSavingPlans();
    return res.json({ plans });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const getAccountDetails = async (req, res) => {
  const { accountNumber } = req.body;
  try {
    const account = await AccountModel.getAccountByAccountNo(accountNumber);
    const branchName = await AccountModel.getBranch(account["branch_code)"]);
    const plan = await AccountModel.getSavingPlan(account["plan_id"]);

    const accountDetails = {
      accountNumber: account["account_number"],
      balance: account["balance"],
      accountType: account["account_type"],
      branchName: branchName["branch_name"],
      plan: plan["plan_name"],
    };

    return res.json({ accountDetails });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const getThisCustomerAccountTransactions = async (req, res) => {
  const { id: cusId } = req.user;
  const {
    accountId,
    startDate,
    transactionType,
    minAmount,
    maxAmount,
    method,
  } = req.query;
  const filters = {
    cust_id: cusId,
    branch_code: null,
    account_id: accountId || null,
    start_date: startDate || null,
    transaction_type: transactionType || null,
    min_amount: minAmount || null,
    max_amount: maxAmount || null,
    method: method || null,
  };
  try {
    const transactions = await AccountModel.getTransactions(filters);
    if (transactions.length === 0) {
      return res.status(500).send({ message: "No transactions" });
    }

    return res.json({ transactions: transactions });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const getThisBranchAccountTransactions = async (req, res) => {
  const { id: employeeId } = req.user;
  const {
    cusId,
    accountId,
    startDate,
    transactionType,
    minAmount,
    maxAmount,
    method,
  } = req.query;
  const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
  const filters = {
    cust_id: cusId || null,
    branch_code: branchCode || null,
    account_id: accountId || null,
    start_date: startDate || null,
    transaction_type: transactionType || null,
    min_amount: minAmount || null,
    max_amount: maxAmount || null,
    method: method || null,
  };
  try {
    const transactions = await AccountModel.getTransactions(filters);
    if (transactions.length === 0) {
      return res.status(500).send({ message: "No transactions" });
    }

    return res.json({ transactions: transactions });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const getBranchAccounts = async (req, res) => {
  const { id: employeeId } = req.user;
  const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
  try {
    const accounts = await AccountModel.getBranchAccounts(branchCode);
    const accountsToSend = accounts.map((account) => {
      return {
        account_number: account.account_number,
        account_id: account.account_id,
      };
    });
    return res.json(accountsToSend);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

export default {
  getCustomerAccounts,
  getThisCustomerAccounts,
  createAccount,
  getSavingPlans,
  getAccountDetails,
  getThisCustomerAccountTransactions,
  getThisBranchAccountTransactions,
  getBranchAccounts,
};
