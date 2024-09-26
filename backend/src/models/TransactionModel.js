import { pool } from "../middleware/constants.js";

const employeeDepositForCustomer = async (account_id, amount, reason) => {
  let connection;
  const method = "via_employee";
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Call the stored procedure
    await connection.query(
      `CALL DepositMoney(?, ?, ?, ?, @p_transaction_id);`,
      [account_id, amount, reason, method]
    );

    // Get the result of the procedure to check if the deposit was successful
    const [result] = await connection.query(
      `SELECT @p_transaction_id AS transaction_id;`
    );

    /// Get the transaction ID
    const transaction_id = result[0].transaction_id;

    // Check if transaction_id is null
    if (transaction_id === null) {
      if (connection) await connection.rollback();
      throw new Error("Deposit failed.");
    }

    await connection.commit();
    return { new_transaction_id: transaction_id };
  } catch (error) {
    if (connection) await connection.rollback();

    if (error.sqlMessage) {
      throw new Error(`${error.sqlMessage}`);
    } else {
      throw new Error("Deposit failed due to an unexpected error.");
      //Code to delete the transaction from the table and also
    }
  } finally {
    if (connection) connection.release();
  }
};

const makeOnlineTransfer = async (
  from_account_id,
  to_account_id,
  amount,
  reason
) => {
  let connection;
  const method = "online_transfer";
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Call the stored procedure
    await connection.query(
      `CALL TransferMoney(?, ?, ?, ?, @p_transaction_id);`,
      [from_account_id, to_account_id, amount, reason]
    );

    // Get the result of the procedure to check if the deposit was successful
    const [result] = await connection.query(
      `SELECT @p_transaction_id AS transaction_id;`
    );

    /// Get the transaction ID
    const transaction_id = result[0].transaction_id;

    // Check if transaction_id is null
    if (transaction_id === null) {
      if (connection) await connection.rollback();
      throw new Error("Transfer failed.");
    }

    await connection.commit();
    return { new_transaction_id: transaction_id };
  } catch (error) {
    if (connection) await connection.rollback();

    if (error.sqlMessage) {
      throw new Error(`${error.sqlMessage}`);
    } else {
      throw new Error("Transfer failed due to an unexpected error.");
      //Code to delete the transaction from the table and also
    }
  } finally {
    if (connection) connection.release();
  }
};

export default { employeeDepositForCustomer, makeOnlineTransfer };
