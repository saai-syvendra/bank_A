import { pool } from "../middleware/constants.js";

const getEmployeeBranch = async (employeeId) => {
  const [row] = await pool.query(
    `
      SELECT branch_code 
      FROM Employee 
      WHERE emp_id = ?;
    `,
    [employeeId]
  );
  const branch = row[0];
  if (!branch) throw new Error("Invalid employeeId");

  return branch.branch_code;
};

const getEmployee = async (id) => {
  let row;

  [row] = await pool.query(
    `
      SELECT * 
      FROM Employee 
      WHERE emp_id = ?;
    `,
    [id]
  );
  const employee = row[0];

  [row] = await pool.query(
    `
      SELECT email, address, mobile
      FROM User_Account
      WHERE user_id = ?;
    `,
    [id]
  );

  const userDeatils = row[0];

  [row] = await pool.query(
    `
      SELECT emp_position
      FROM Employee_Position
      WHERE id = ?;
    `,
    [employee["position_id"]]
  );

  const position = row[0];

  if (!employee) throw new Error("Invalid employeeId");

  return { ...employee, ...userDeatils, ...position };
};

// MAKE A PROCEDURE!!
const updateEmployee = async (id, employeeDetails) => {
  const { first_name, last_name, mobile, address, experience } =
    employeeDetails;
  await pool.query(
    `
      CALL UpdateEmployee(?, ?, ?, ?, ?, ?);
      `,
    [id, first_name, last_name, mobile, address, experience]
  );
};

export default { getEmployeeBranch, getEmployee, updateEmployee };
