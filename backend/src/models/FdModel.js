import { pool } from "../middleware/constants.js";

const getCustomerFds = async (customerId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT * 
        FROM FD LEFT JOIN Customer_Account USING(account_id) 
        WHERE customer_id = ?;
      `,
      [customerId]
    );

    if (rows.length === 0) throw new Error("No FDs found for this customer");

    await connection.commit();
    return rows;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getFdPlans = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT * 
        FROM FD_Plan
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

const createFd = async (plan_id, account_id, amount) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
        CALL CreateFd(?, ?, ?);
      `,
      [plan_id, account_id, amount]
    );
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getFixedDepositsByAccountId = async (accountId) => {
  let connection;
  try {
    connection = await pool.getConnection(); // Get a connection from the pool
    await connection.beginTransaction(); // Begin a transaction

    const [rows] = await connection.query(
      `
        SELECT FD.*,FD_Plan.interest
        FROM FD
        JOIN Customer_Account ca USING(account_id)
        JOIN FD_Plan ON FD.plan_id=FD_Plan.id
        WHERE account_id = ?;
      `,
      [accountId] // Use accountId as a parameter
    );

    await connection.commit(); // Commit the transaction
    return rows; // Return the results
  } catch (error) {
    if (connection) await connection.rollback(); // Rollback if there is an error
    throw error;
  } finally {
    if (connection) connection.release(); // Release the connection back to the pool
  }
};

export default {
  getCustomerFds,
  getFdPlans,
  createFd,
  getFixedDepositsByAccountId,
};
