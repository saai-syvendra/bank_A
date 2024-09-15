import LoanModel from "../models/LoanModel.js";

const createLoan = async (req, res) => {
    const { plan_id, customer_id, connected_account, loan_amount } = req.body;
    try {
        await LoanModel.createLoan(
            plan_id,
            customer_id,
            connected_account,
            loan_amount
        );
        res.status(201).send("Loan created successfully!");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const createOnlineLoan = async (req, res) => {
    const { plan_id, customer_id, fd_id, connected_account, loan_amount } =
        req.body;
    try {
        await LoanModel.createOnlineLoan(
            plan_id,
            customer_id,
            fd_id,
            connected_account,
            loan_amount
        );
        res.status(201).send("Online loan created successfully!");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getLoanPlans = async (req, res) => {
    try {
        const plans = await LoanModel.getLoanPlans();
        res.status(200).send(plans);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export default { createLoan, createOnlineLoan, getLoanPlans };
