import jwt from "jsonwebtoken";
import AccountModel from "../models/AccountModel.js";
import CustomerModel from "../models/CustomerModel.js";
import TransactionModel from "../models/TransactionModel.js";

const getCDMinformation = async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET;
  const { accountNo } = req.query;
  try {
    const account = await AccountModel.getAccountByAccountNo(accountNo);
    const customer = await CustomerModel.getCustomer(account.customer_id);
    let customerName;
    if (customer.c_type === "individual") {
      customerName = `${customer.first_name} ${customer.last_name}`;
    } else if (customer.c_type === "organisation") {
      customerName = customer.org_name;
    }
    const atmInfo = {
      accountNo: account.account_number,
      accountId: account.account_id,
      name: customerName,
    };

    const token = jwt.sign(
      {
        role: "machine",
      },
      jwtSecret,
      {
        expiresIn: "10m",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutes
    });
    return res.json(atmInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const makeCDMdeposit = async (req, res) => {
  const { account_id, amount, reason } = req.body;

  try {
    const result = await TransactionModel.cashDeposit(
      account_id,
      amount,
      reason,
      "atm-cdm"
    );
    res.status(200).json({
      message: "Transaction committed successfully",
      transaction_id: result.transaction_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getCDMinformation,
  makeCDMdeposit,
};
