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

    if (rows.length === 0)
        throw new Error("No accounts found for this customer");
    return rows;
};

const createAccount = async (
    plan_id,
    branch_code,
    customer_id,
    balance,
    account_type
) => {
    await pool.query(
        `
          INSERT INTO Customer_Account (plan_id, branch_code, customer_id, balance, starting_date, account_type)
          VALUES (?, ?, ?, ?, CURRENT_DATE(), ?);
      `,
        [plan_id, branch_code, customer_id, balance, account_type]
    );
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

const getSavingPlan = async (planId) => {
    const [row] = await pool.query(
        `
            SELECT *
            FROM Saving_Plan
            WHERE plan_id = ?;
        `,
        [planId]
    );

    const plan = row[0];
    if (!plan) throw new Error("Invalid planId");

    if (plan["availability"] === "no") throw new Error("Plan unavailable");

    return plan;
};

const getBranch = async (branchCode) => {
    const [row] = await pool.query(
        `
            SELECT *
            FROM Branch
            WHERE branch_code = ?;
        `,
        [branchCode]
    );

    const branch = row[0];
    if (!branch) throw new Error("Invalid branchId");

    return branch;
};

export default {
    getAccountByAccountNo,
    getAccountById,
    getCustomerAccounts,
    createAccount,
    getSavingPlans,
    getSavingPlan,
    getBranch,
};
