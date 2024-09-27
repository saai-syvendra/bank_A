import TransactionModel from "../models/TransactionModel.js";
import AccountModel from "../models/AccountModel.js";

const employeeDepositForCustomerController = async (req, res) => {
  const { account_id, amount, reason } = req.body;
  //console.log("Received data:", req.body);

  try {
    const result = await TransactionModel.employeeDepositForCustomer(
      account_id,
      amount,
      reason
    );
    res.status(200).json({
      message: "Transaction committed successfully",
      transaction_id: result.transaction_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const makeOnlineTransfer = async (req, res) => {
  const { fromAccountId, toAccountNo, amount, reason } = req.body;
  try {
    const account = await AccountModel.getAccountByAccountNo(toAccountNo);
    const result = await TransactionModel.makeOnlineTransfer(
      fromAccountId,
      account.account_id,
      amount,
      reason
    );
    res.status(200).json({
      message: "Transaction committed successfully",
      transaction_id: result.transaction_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { employeeDepositForCustomerController, makeOnlineTransfer };
