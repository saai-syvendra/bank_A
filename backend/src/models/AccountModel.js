import { pool } from "../middleware/constants.js";

const getAccountById = async (id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [row] = await connection.query(
      `
        SELECT * 
        FROM Customer_Account 
        LEFT JOIN Saving_Account USING(account_id)
        WHERE account_id = ?;
      `,
      [id]
    );
    const account = row[0];
    if (!account) throw new Error("Invalid accountId");

    await connection.commit();
    return account;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getAccountByAccountNo = async (accountNo) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [row] = await connection.query(
      `
        SELECT * 
        FROM Customer_Account 
        LEFT JOIN Saving_Account USING(account_id)
        WHERE account_number = ?;
      `,
      [accountNo]
    );
    const account = row[0];
    if (!account) throw new Error("Invalid Account Number");

    await connection.commit();
    return account;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getCustomerAccounts = async (customerId, accountType) => {
  let connection;
  let rows;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (accountType) {
      [rows] = await connection.query(
        `
          SELECT * 
          FROM Customer_Account 
          LEFT JOIN Saving_Account USING(account_id)
          WHERE customer_id = ? AND account_type = ?;
        `,
        [customerId, accountType]
      );
    } else {
      [rows] = await connection.query(
        `
          SELECT * 
          FROM Customer_Account 
          LEFT JOIN Saving_Account USING(account_id)
          WHERE customer_id = ?;
        `,
        [customerId]
      );
    }
    if (rows.length === 0)
      throw new Error("No accounts found for this customer");

    await connection.commit();
    return rows;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

//WRITE A PROCEDURE!!!
const createAccount = async (
  plan_id,
  branch_code,
  customer_id,
  balance,
  account_type
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
        INSERT INTO Customer_Account (plan_id, branch_code, customer_id, balance, starting_date, account_type)
        VALUES (?, ?, ?, ?, CURRENT_DATE(), ?);
      `,
      [plan_id, branch_code, customer_id, balance, account_type]
    );

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getSavingPlans = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT * 
        FROM Saving_Plan
        WHERE availability = 1;
      `
    );

    await connection.commit();
    return rows;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getSavingPlan = async (planId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [row] = await connection.query(
      `
        SELECT *
        FROM Saving_Plan
        WHERE id = ?;
      `,
      [planId]
    );

    const plan = row[0];
    if (!plan) throw new Error("Invalid planId");
    if (plan["availability"] === 0) throw new Error("Plan unavailable");

    await connection.commit();
    return plan;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getBranch = async (branchCode) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [row] = await connection.query(
      `
        SELECT *
        FROM Branch
        WHERE branch_code = ?;
      `,
      [branchCode]
    );

    const branch = row[0];
    if (!branch) throw new Error("Invalid branchId");

    await connection.commit();
    return branch;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getBranchAccounts = async (branch_code) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT *
        FROM Customer_Account 
        LEFT JOIN Saving_Account USING(account_id)
        WHERE branch_code = ?;
      `,
      [branch_code]
    );
    if (rows.length === 0) throw new Error("No accounts found for this branch");

    await connection.commit();
    return rows;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getAccountTransactions = async (accountNumber) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        CALL GetTransactions(?);
      `,
      [accountNumber]
    );
    if (rows.length === 0)
      throw new Error("No accounts found for this customer");

    await connection.commit();
    return rows;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getTransactions = async (filters) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        CALL GetTransactionsFiltered(?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        filters.cust_id,
        filters.branch_code,
        filters.account_id,
        filters.start_date,
        filters.transaction_type,
        filters.min_amount,
        filters.max_amount,
        filters.method,
      ]
    );
    if (rows.length === 0)
      throw new Error("No accounts found for this customer");

    await connection.commit();
    return rows[0];
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export default {
  getAccountByAccountNo,
  getAccountById,
  getCustomerAccounts,
  createAccount,
  getSavingPlans,
  getSavingPlan,
  getBranch,
  getAccountTransactions,
  getBranchAccounts,
  getTransactions,
};
