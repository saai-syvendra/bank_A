import { pool } from "../middleware/constants.js";

const getCustomerFds = async (customerId) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `
              SELECT * 
              FROM fd LEFT JOIN Customer_Account USING(account_id) 
              WHERE customer_id = ?;
          `,
            [customerId]
        );

        if (rows.length === 0)
            throw new Error("No FDs found for this customer");

        await connection.commit();
        return rows;
    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export default { getCustomerFds };
