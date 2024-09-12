import { pool } from "../middleware/constants.js";

const getAccountById = async (id) => {
    const [row] = await pool.query(
        `
          SELECT * 
          FROM Customer_Account 
          WHERE account_id = ?;
      `,
        [id]
    );
    const account = row[0];
    if (!account) throw new Error("Invalid accountId");

    return account;
};

const getAccountByAccountNo = async (accountNo) => {
    const [row] = await pool.query(
        `
          SELECT * 
          FROM Customer_Account 
          WHERE account_number = ?;
      `,
        [accountNo]
    );
    const account = row[0];
    if (!account) throw new Error("Invalid accountId");

    return account;
};

const getCustomerAccounts = async (customerId) => {
    const [rows] = await pool.query(
        `
          SELECT * 
          FROM Customer_Account 
          WHERE customer_id = ?;
      `,
        [customerId]
    );

    if(rows.length === 0) throw new Error("No accounts found for this customer");
    return rows;
};

const createAccount = async (plan_id, branch_code, customer_id, balance, account_type) => {
    const [row] = await pool.query(
        `
          INSERT INTO Customer_Account (plan_id, branch_code, customer_id, balance, starting_date, account_type)
          VALUES (?, ?, ?, ?, CURRENT_DATE(), ?);
      `,
        [plan_id, branch_code, customer_id, balance, account_type]
    );
    return row;
};

const getSavingPlans = async () => {
    const [rows] = await pool.query(
        `
          SELECT * 
          FROM Saving_Plan
          WHERE availability = "yes";
      `
    );

    return rows;
};

export default {getAccountByAccountNo, getAccountById, getCustomerAccounts, createAccount};
