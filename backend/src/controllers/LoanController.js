import LoanModel from "../models/LoanModel.js";

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
  const { planId, fdId, connectedAccount, loanAmount, reason } = req.body;
  try {
    await LoanModel.createOnlineLoan(
      planId,
      customerId,
      fdId,
      connectedAccount,
      loanAmount,
      reason
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
    const loans = await LoanModel.getApprovalPendingLoans();
    res.status(200).send(loans);
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

export default {
  createLoan,
  createOnlineLoan,
  getLoanPlans,
  getApprovalPendingLoans,
  approveLoan,
  rejectLoan,
};
