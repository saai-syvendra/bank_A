import AccountModel from "../models/AccountModel.js";
import EmployeeModel from "../models/EmployeeModel.js";
import CustomerModel from "../models/CustomerModel.js";

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
  const { customerId, balance, accountType } = req.body;
  const branchCode = await EmployeeModel.getEmployeeBranch(req.user.id);
  try {
    await AccountModel.createAccount(
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
    const branch = await AccountModel.getBranch(account["branch_code"]);
    let plan;
    if (account["account_type"] === "saving") {
      plan = await AccountModel.getSavingPlan(account["plan_id"]);
    } else {
      plan = { name: "N/A" };
    }

    const accountDetails = {
      accountNumber: account["account_number"],
      balance: account["balance"],
      accountType: account["account_type"],
      branchName: branch["city"],
      plan: plan["name"],
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

const getAccountIDByAccountNo = async (req, res) => {
  const { accountNo } = req.body;
  try {
    const account = await AccountModel.getAccountByAccountNo(accountNo);
    return res.json({ account_id: account.account_id });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const getATMinformation = async (req, res) => {
  const { accountNo } = req.query;
  console.log(accountNo);
  try {
    const account = await AccountModel.getAccountByAccountNo(accountNo);
    const customer = await CustomerModel.getCustomer(account.customer_id);
    let customerName;
    if (customer.c_type === "individual") {
      customerName = `${customer.first_name} ${customer.last_name}`;
    } else if (customer.c_type === "organisation") {
      customerName = customer.name;
    }
    const atmInfo = {
      accountNo: account.account_number,
      accountId: account.account_id,
      balance: account.balance,
      accountType: account.account_type,
      name: customerName,
    };
    return res.json(atmInfo);
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
  getAccountIDByAccountNo,
  getATMinformation,
};
