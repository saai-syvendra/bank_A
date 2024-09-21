import { pool } from "../middleware/constants.js";

const createLoan = async (
  plan_id,
  customer_id,
  connected_account,
  loan_amount,
  branch_code,
  reason
) => {
  await pool.query(
    `
          INSERT INTO Loan (plan_id, customer_id, connected_account, request_date, loan_amount, state, branch_code, reason) 
          VALUES (?, ?, ?, CURRENT_DATE(), ?, 'pending', ?, ?);
      `,
    [plan_id, customer_id, connected_account, loan_amount, branch_code, reason]
  );
};

const createOnlineLoan = async (
  plan_id,
  customer_id,
  fd_id,
  connected_account,
  loan_amount,
  reason
) => {
  await pool.query(
    `
          CALL CreateOnlineLoan(?, ?, ?, ?, ?, ?);
      `,
    [customer_id, plan_id, fd_id, loan_amount, connected_account, reason]
  );
};

const getLoanPlans = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
              SELECT * 
              FROM Loan_Plan
              WHERE availability = "yes";
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

const getPlan = async (plan_id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
                SELECT * 
                FROM Loan_Plan
                WHERE plan_id = ?;
            `,
      [plan_id]
    );

    await connection.commit();
    return rows[0];
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getApprovalPendingLoans = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
              SELECT * 
              FROM Loan
              WHERE state = "pending";
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

const approveLoan = async (loan_id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
        UPDATE Loan
        SET state = "approved"
        WHERE loan_id = ?;
      `,
      [loan_id]
    );

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const rejectLoan = async (loan_id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
        UPDATE Loan
        SET state = "rejected"
        WHERE loan_id = ?;
      `,
      [loan_id]
    );

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export default {
  createLoan,
  createOnlineLoan,
  getLoanPlans,
  getPlan,
  getApprovalPendingLoans,
  approveLoan,
  rejectLoan,
};
