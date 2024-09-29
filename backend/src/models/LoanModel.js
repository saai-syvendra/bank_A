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
          CALL ApproveLoan(?);
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

const getUpcomingInstallments = async (customer_id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT 
            L.loan_id, 
            LI.installment_no, 
            LI.installment_amount, 
            LI.due_date, 
            LI.state,
            L.loan_amount,
            LP.months
        FROM Loan L
        JOIN Loan_Installment LI USING(loan_id)
        JOIN Loan_Plan LP Using(plan_id)
        WHERE L.customer_id = 10001 
        AND LI.state = 'pending'
        AND LI.due_date = (
            SELECT MIN(LI2.due_date)
            FROM Loan_Installment LI2
            WHERE LI2.loan_id = L.loan_id
                AND LI2.state = 'pending'
        )
        ORDER BY L.loan_id;
      `,
      [customer_id]
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

const payInstallment = async (loan_id, installment_no, account_id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
        CALL PayInstallment(?, ?, ?);
      `,
      [loan_id, installment_no, account_id]
    );

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getLateLoanInstallments = async (filters) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        CALL GetLateLoanInstallments(?, ?, ?, ?, ?, ?); 
      `,
      [
        filters.branch_code,
        filters.min_amount,
        filters.max_amount,
        filters.customer_id,
        filters.start_date,
        filters.end_date,
      ]
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

const getLoanCustomers = async (branch_code) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT DISTINCT customer_id
        FROM Loan
        WHERE branch_code = ?;
      `,
      [branch_code]
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

export default {
  createLoan,
  createOnlineLoan,
  getLoanPlans,
  getPlan,
  getApprovalPendingLoans,
  approveLoan,
  rejectLoan,
  getUpcomingInstallments,
  payInstallment,
  getLateLoanInstallments,
  getLoanCustomers,
};
