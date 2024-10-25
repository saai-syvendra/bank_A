import TransactionModel from "../models/TransactionModel.js";
import AccountModel from "../models/AccountModel.js";

const employeeDepositForCustomerController = async (req, res) => {
  const { account_id, amount, reason } = req.body;
  try {
    const result = await TransactionModel.cashDeposit(
      account_id,
      amount,
      reason,
      "via_employee"
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
  //console.log(req.body);
  const { fromAccountId, toAccountNo, amount, reason,fromAccountNo } = req.body;
  try {
    if (fromAccountNo === toAccountNo) {
      throw new Error("Cannot transfer money to the same account");
    }
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

export default {
  employeeDepositForCustomerController,
  makeOnlineTransfer,
};
