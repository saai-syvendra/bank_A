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

  [row] = await pool.query(
    `
      SELECT email, address, mobile
      FROM User_Account
      WHERE user_id = ?;
    `,
    [id]
  );

  const userDeatils = row[0];

  let detail;
  if (customer["c_type"] === "individual") {
    [row] = await pool.query(
      `
        SELECT * 
        FROM Individual_Customer 
        WHERE customer_id = ?;
      `,
      [id]
    );
  } else if (customer["c_type"] === "organisation") {
    [row] = await pool.query(
      `
        SELECT * 
        FROM Organisation_Customer 
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
    ...userDeatils,
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
  const { email, address, mobile, nic, firstName, lastName, dob, brc, name } =
    customerDetails;

  await pool.query(`CALL CreateCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
    email,
    address,
    mobile,
    c_type,
    nic,
    firstName,
    lastName,
    dob,
    brc,
    name,
  ]);
};

const updateCustomer = async (id, customerDetails) => {
  const { address, mobile, firstName, lastName, name } = customerDetails;
  await pool.query(
    `
      CALL UpdateCustomer(?, ?, ?, ?, ?, ?);
    `,
    [id, address, mobile, firstName, lastName, name]
  );
};

const getCustomerIDFromAccountNo = async (accountNo) => {
  let row;
  [row] = await pool.query(
    `
      SELECT customer_id 
      FROM Customer_Account 
      WHERE account_number = ?;
    `,
    [accountNo]
  );
  if (!row[0]) throw new Error("Invalid account number");
  const customerId = row[0]["customer_id"];
  return customerId;
};
const getthisBranchCustomers = async (branch_code) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT DISTINCT c.customer_id, c.c_type, ic.nic, ic.first_name, ic.last_name, oc.name 
          FROM Customer c 
          LEFT JOIN Individual_Customer ic USING(customer_id) 
          LEFT JOIN Organisation_Customer oc USING(customer_id) 
          RIGHT JOIN Customer_Account USING(customer_id)
          WHERE branch_code = ?;
      `,
      [branch_code]
    );

    if (rows.length === 0) throw new Error("No customers found for this branch");

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
  getCustomer,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  getCustomerIDFromAccountNo,
  getthisBranchCustomers,
};
