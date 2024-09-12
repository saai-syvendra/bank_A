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
        await AccountModel.createAccount(planId, branchCode, customerId, balance, accountType);
        return res.json({message: "success"});
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

export default {getCustomerAccounts, createAccount, getSavingPlans};