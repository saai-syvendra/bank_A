import { employeeDepositForCustomer } from "../models/TransactionModel.js";

const employeeDepositForCustomerController = async (req, res) => {
  const { account_id, amount, reason } = req.body;

  try {
    const result = await employeeDepositForCustomer(account_id, amount, reason);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { employeeDepositForCustomerController };
