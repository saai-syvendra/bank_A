import { pool } from "../middleware/constants.js";

const employeeDepositForCustomer = async (account_id, amount, reason) => {
  let connection;
  const method = "via_employee";
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Call the stored procedure
    await connection.query(
        `CALL DepositMoney(?, ?, ?, ?, @p_success);`,
        [account_id, amount, reason, method]
    );

    //  Get the result of the procedure to check if the deposit was successful
    const [result] = await connection.query(`SELECT @p_success AS success;`);
    console.log(result);

    //Get the result of the procedure to check if the deposit was successful
    const p_success = result[0].success;
    console.log(p_success);

    // Check if p_success is null or false
     if (p_success === null || p_success === false) {
      if (connection) await connection.rollback();
      throw new Error("Deposit failed.");
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    if (connection) await connection.rollback();

    if (error.sqlMessage) {
      throw new Error(`SQL Error: ${error.sqlMessage}`);
    } else {
      throw new Error("Deposit failed due to an unexpected error.");
    }
  } finally {
    if (connection) connection.release();
  }
};

export { employeeDepositForCustomer };
