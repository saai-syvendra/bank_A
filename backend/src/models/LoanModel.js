import { pool } from "../middleware/constants.js";

const createLoan = async (
    plan_id,
    customer_id,
    connected_account,
    loan_amount
) => {
    await pool.query(
        `
          INSERT INTO Loan (plan_id, customer_id, connected_account, request_date, loan_amount, state) 
          VALUES (?, ?, ?, CURRENT_DATE(), ?, 'pending');
      `,
        [plan_id, customer_id, connected_account, loan_amount]
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

export default { createLoan, createOnlineLoan, getLoanPlans };
