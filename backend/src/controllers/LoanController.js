import LoanModel from "../models/LoanModel.js";

const createLoan = async (req, res) => {
    const { planId, customerId, connectedAccount, loanAmount } = req.body;
    try {
        await LoanModel.createLoan(
            planId,
            customerId,
            connectedAccount,
            loanAmount
        );
        res.status(201).json({ message: "Loan created successfully!" });
    } catch (error) {
        res.status(400).send({ message: error.message });
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

export default { createLoan, createOnlineLoan, getLoanPlans };
