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
}

export default {getEmployeeBranch};