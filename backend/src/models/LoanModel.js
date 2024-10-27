import { pool } from "../middleware/constants.js";

// MAKE PROCERDUE!!!
const createLoan = async (
  plan_id,
  customer_id,
  connected_account,
  loan_amount,
  reason
) => {
  await pool.query(
    `
      CALL CreateBranchLoan(?, ?, ?, ?, ?);
    `,
    [customer_id, plan_id, loan_amount, connected_account, reason]
  );
};

const createOnlineLoan = async (
  plan_id,
  customer_id,
  fd_id,
  connected_account,
  loan_amount
) => {
  await pool.query(
    `
      CALL CreateOnlineLoan(?, ?, ?, ?, ?);
    `,
    [customer_id, plan_id, fd_id, loan_amount, connected_account]
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

const getPlan = async (plan_id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT * 
        FROM Loan_Plan
        WHERE availability = 1 AND id = ?;
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
        FROM Branch_Loan bl 
        LEFT JOIN Loan l ON bl.loan_id=l.id 
        WHERE bl.state='pending';
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
        UPDATE Branch_Loan
        SET state = "disapproved"
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
            L.id, 
            LI.installment_no, 
            LI.installment_amount, 
            LI.due_date, 
            LI.state,
            L.loan_amount,
            LP.months
        FROM Loan L
        JOIN Loan_Installment LI ON L.id=LI.loan_id
        JOIN Loan_Plan LP ON L.plan_id=LP.id
        JOIN Customer_Account CA ON L.connected_account=CA.account_id
        WHERE CA.customer_id = ? 
        AND LI.state = 'pending'
        AND LI.due_date = (
            SELECT MIN(LI2.due_date)
            FROM Loan_Installment LI2
            WHERE LI2.loan_id = L.id AND LI2.state = 'pending'
        )
        ORDER BY L.id;
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
        SELECT DISTINCT ca.customer_id
        FROM Loan l
        LEFT JOIN Customer_Account ca ON l.connected_account = ca.account_id
        WHERE ca.branch_code = ?;
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

const getLoansByAccountId = async (accountId) => {
  let connection;
  try {
    connection = await pool.getConnection(); // Get a connection from the pool
    await connection.beginTransaction(); // Begin a transaction

    const [rows] = await connection.query(
      `
        SELECT Loan.*, Loan_Plan.interest, Loan_Plan.name, Online_Loan.fd_id
        FROM Loan 
        JOIN Loan_Plan ON Loan.plan_id = Loan_Plan.id
        LEFT JOIN Online_Loan ON Loan.id = Online_Loan.loan_id
        WHERE Loan.start_date IS NOT NULL AND Loan.connected_account = ?;
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

const getBranchLoanSummary = async (branch_code) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT 
          l.id AS loan_id,
          lp.name,
          l.loan_amount,
          l.start_date,
          ca.account_number,
          ca.customer_id,
          COUNT(CASE WHEN li.state = 'paid' THEN 1 END) AS paid_installments,
          lp.months AS total_installments
        FROM 
          Loan l
        LEFT JOIN
          Loan_Plan lp ON l.plan_id = lp.id
        LEFT JOIN 
            Customer_Account ca ON ca.account_id = l.connected_account
        LEFT JOIN 
            Loan_Installment li ON li.loan_id = l.id
        WHERE ca.branch_code = ?
        GROUP BY 
            l.id, ca.account_number, ca.customer_id, l.loan_amount
        HAVING 
              paid_installments < total_installments;
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
  getLoansByAccountId,
  getBranchLoanSummary,
};
