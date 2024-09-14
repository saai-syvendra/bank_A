import AccountModel from "../models/AccountModel.js";
import EmployeeModel from "../models/EmployeeModel.js";

const getCustomerAccounts = async (req, res) => {
    const { customerId } = req.body;
    try {
        const accounts = await AccountModel.getCustomerAccounts(customerId);
        return res.json({ accounts });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
};

const createAccount = async (req, res) => {
    const { planId, customerId, balance, accountType } = req.body;
    const branchCode = await EmployeeModel.getEmployeeBranch(req.user.id);
    console.log(branchCode);
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
        const branchName = await AccountModel.getBranch(
            account["branch_code)"]
        );
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

export default {
    getCustomerAccounts,
    createAccount,
    getSavingPlans,
    getAccountDetails,
};
