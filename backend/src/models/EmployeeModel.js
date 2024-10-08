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
  const [row] = await pool.query(
    `
      SELECT * 
      FROM Employee 
      WHERE emp_id = ?;
    `,
    [id]
  );
  const employee = row[0];

  if (!employee) throw new Error("Invalid employeeId");

  return employee;
};

// MAKE A PROCEDURE!!
const updateEmployee = async (id, data) => {
  await pool.query(
    `
          UPDATE Employee 
          SET ? 
          WHERE emp_id = ?;
      `,
    [data, id]
  );
};

export default { getEmployeeBranch, getEmployee, updateEmployee };
