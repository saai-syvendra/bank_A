import { pool } from "../middleware/constants.js";

// CREATE PROCEDURE GetLoanReport(
//     IN start_date DATE,
//     IN end_date DATE,
//     IN min_ammount DECIMAL(10,2),
//     IN max_ammount DECIMAL(10,2),
//     IN state ENUM('pending','approved','online'),
//     IN branch INT,
//     IN plan_id INT,
//     IN is_late_loan BOOL
// )

const GetLoanReport = async (start_date, end_date, min_amount, max_amount, state, branch, plan_id, is_late_loan) => {
    const query = `CALL GetLoanReport(?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [start_date, end_date, min_amount, max_amount, state, branch, plan_id, is_late_loan];
    const [result] = await pool.query(query, params);
    console.log(result[0]);
    return result[0];
};

// CREATE PROCEDURE GetOverallLoanReport(
//     IN start_date DATE,
//     IN end_date DATE,
//     IN state ENUM('pending','approved','online'),
//     IN branch_code INT,
//     IN report_frequency ENUM('daily', 'weekly', 'monthly')
// )

const GetOverallLoanReport = async (start_date, end_date, state, branch_code, report_frequency) => {
    const query = `CALL GetOverallLoanReport(?, ?, ?, ?, ?)`;
    const params = [start_date, end_date, state, branch_code, report_frequency];
    const [result] = await pool.query(query, params);
    console.log(result[0]);
    return result[0];
};

// CREATE PROCEDURE GetOverallLateLoanReport(
//     IN end_date DATE,
//     IN branch_code INT,
//     IN report_frequency ENUM('daily', 'weekly', 'monthly')
// )

const GetOverallLateLoanReport = async (end_date, branch_code, report_frequency) => {
    const query = `CALL GetOverallLateLoanReport(?, ?, ?)`;
    const params = [end_date, branch_code, report_frequency];
    const [result] = await pool.query(query, params);
    console.log(result[0]);
    return result[0];
};

// CREATE PROCEDURE GetTransactionReport(
//     IN start_date TIMESTAMP,
//     IN end_date TIMESTAMP,
//     IN max_amount DECIMAL(10,2),
//     IN min_amount DECIMAL(10,2),
//     IN transaction_type ENUM('credit','debit'),
//     IN transaction_method ENUM('atm-cdm','online-transfer','server','via_employee'),
//     IN branch_code INT
// )

const GetTransactionReport = async (start_date, end_date, max_amount, min_amount, transaction_type, transaction_method, branch_code) => {
    const query = `CALL GetTransactionReport(?, ?, ?, ?, ?, ?, ?)`;
    const params = [start_date, end_date, max_amount, min_amount, transaction_type, transaction_method, branch_code];
    const [result] = await pool.query(query, params);
    console.log(result[0]);
    return result[0];
};

// CREATE PROCEDURE GetTransactionOverallReport(
//     IN start_date TIMESTAMP,
//     IN end_date TIMESTAMP,
//     IN transaction_type ENUM('credit','debit'),
//     IN transaction_method ENUM('atm-cdm','online-transfer','server','via_employee'),
//     IN branch_code INT,
//     IN report_period ENUM('daily', 'weekly', 'monthly')
// )

const GetTransactionOverallReport = async (start_date, end_date, transaction_type, transaction_method, branch_code, report_period) => {
    const query = `CALL GetTransactionOverallReport(?, ?, ?, ?, ?, ?)`;
    const params = [start_date, end_date, transaction_type, transaction_method, branch_code, report_period];
    const [result] = await pool.query(query, params);
    console.log(result[0]);
    return result[0];
};

export default {
    GetLoanReport,
    GetOverallLoanReport,
    GetOverallLateLoanReport,
    GetTransactionReport,
    GetTransactionOverallReport
};