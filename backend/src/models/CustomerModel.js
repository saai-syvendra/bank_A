import { pool } from "../middleware/constants.js";

const getCustomer = async (id) => {
  let row;
  [row] = await pool.query(
    `
          SELECT * 
          FROM Customer 
          WHERE customer_id = ?;
      `,
    [id]
  );
  const customer = row[0];

  if (!customer) throw new Error("Invalid customerId");
  let detail;
  if (customer["c_type"] === "individual") {
    [row] = await pool.query(
      `
              SELECT * 
              FROM Person 
              WHERE customer_id = ?;
          `,
      [id]
    );
  } else if (customer["c_type"] === "organisation") {
    [row] = await pool.query(
      `
              SELECT * 
              FROM Organisation 
              WHERE customer_id = ?;
          `,
      [id]
    );
  }
  detail = row[0];
  if (!detail) throw new Error("Invalid customerId");

  const customerDetail = {
    c_type: customer["c_type"],
    ...detail,
  };

  return customerDetail;
};

const getAllCustomers = async () => {
  const [rows] = await pool.query(
    `
          SELECT * 
          FROM Customer;
      `
  );

  const customers = [];
  for (const row of rows) {
    const id = row["customer_id"];
    const customer = await getCustomer(id);
    customers.push(customer);
  }

  return customers;
};

const createCustomer = async (c_type, customerDetails) => {
  const connection = await pool.getConnection();
  let customerId;

  try {
    await connection.beginTransaction();

    // Insert into Customer table
    const [result] = await connection.query(
      `INSERT INTO Customer (c_type) VALUES (?)`,
      [c_type]
    );

    customerId = result.insertId;

    // Based on c_type, call the appropriate stored procedure
    if (c_type === "individual") {
      const { nic, firstName, lastName, mobile, email, dob, address } =
        customerDetails;

      await connection.query(`CALL createPerson(?, ?, ?, ?, ?, ?, ?, ?)`, [
        nic,
        firstName,
        lastName,
        mobile,
        email,
        dob,
        address,
        customerId,
      ]);
    } else if (c_type === "organisation") {
      const { brc, orgName, address, telephone, email } = customerDetails;

      await connection.query(`CALL createOrganisation(?, ?, ?, ?, ?, ?)`, [
        brc,
        orgName,
        address,
        telephone,
        email,
        customerId,
      ]);
    }

    await connection.commit();
  } catch (error) {
    console.error("Error occurred:", error.message);

    try {
      if (customerId) {
        await connection.query(`DELETE FROM Customer WHERE customer_id = ?`, [
          customerId,
        ]);
        connection.commit();
      }
    } catch (deleteError) {
      console.error(
        "Error occurred during customer deletion:",
        deleteError.message
      );
    }

    await connection.rollback();
    throw new Error("Error creating customer: " + error.message);
  } finally {
    connection.release();
  }
};

const updateCustomer = async (id, data) => {
  await pool.query(
    `
          UPDATE Person 
          SET ? 
          WHERE customer_id = ?;
      `,
    [data, id]
  );
};

const getCustomerIDFromAccountNo = async (accountNo) => {
  let row;
  let customerDetail;
  [row] = await pool.query(
    `
          SELECT customer_id 
          FROM Customer_Account 
          WHERE account_number = ?;
      `,
    [accountNo]
  );
  const customerId = row[0]["customer_id"];

  if (!customerId) throw new Error("Invalid account number");

  return customerId;
};

export default { getCustomer, getAllCustomers, createCustomer, updateCustomer, getCustomerIDFromAccountNo };
