import FdModel from "../models/FdModel.js";

const getThisCustomerFds = async (req, res) => {
  const { id: customerId } = req.user;
  try {
    const fds = await FdModel.getCustomerFds(customerId);

    const filteredFds = fds.map((fd) => ({
      fd_id: fd.fd_id,
      starting_date: fd.starting_date,
      amount: fd.amount,
      maturity_date: fd.maturity_date,
      account_number: fd.account_number,
      branch_code: fd.branch_code,
    }));

    res.json({ fds: filteredFds });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFdPlans = async (req, res) => {
  try {
    const plans = await FdModel.getFdPlans();
    res.status(200).send(plans);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const createFd = async (req, res) => {
  const { planId, connectedAccount, fdAmount } = req.body;
  try {
    await FdModel.createFd(planId, connectedAccount, fdAmount);
    res.status(201).send({ message: "Fixed deposit created successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const getFDsForThisAccount = async (req, res) => {
  const { accountId } = req.query; // Account ID passed as a parameter
  try {
    const fixedDeposits = await FdModel.getFixedDepositsByAccountId(accountId);
    return res.json({fixedDeposits});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export default { getThisCustomerFds, getFdPlans, createFd,getFDsForThisAccount };
