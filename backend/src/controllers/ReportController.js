import ReportModel from "../models/ReportModel.js";
import EmployeeModel from "../models/EmployeeModel.js";

const GetLoanReportController = async (req, res) => {
    const { start_date, end_date, min_ammount, max_ammount, state, plan_id, is_late_loan } = req.body;
    const { id: employeeId } = req.user;
    try {
        const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
        // Assign default values for null or undefined parameters
        const startDate = start_date || null;
        const endDate = end_date || null;
        const minAmount = min_ammount || null;
        const maxAmount = max_ammount || null;
        const loanState = state || null;
        const planId = plan_id || null;
        const isLateLoan = is_late_loan === undefined ? null : is_late_loan;

        const result = await ReportModel.GetLoanReport(startDate, endDate, minAmount, maxAmount, loanState, branchCode, planId, isLateLoan);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const GetOverallLoanReportController = async (req, res) => {
    const { start_date, end_date, state, report_frequency } = req.body;
    const { id: employeeId } = req.user;
    try {
        const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
        
        // Assign default values for null or undefined parameters
        const startDate = start_date || null;
        const endDate = end_date || null;
        const loanState = state || null;
        const reportFrequency = report_frequency || null;

        const result = await ReportModel.GetOverallLoanReport(startDate, endDate, loanState, branchCode, reportFrequency);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const GetOverallLateLoanReportController = async (req, res) => {
    const { end_date, report_frequency } = req.body;
    const { id: employeeId } = req.user;
    try {
        const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
        // Assign default values for null or undefined parameters
        const endDate = end_date || null;
        const reportFrequency = report_frequency || null;

        const result = await ReportModel.GetOverallLateLoanReport(endDate, branchCode, reportFrequency);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const GetTransactionReportController = async (req, res) => {
    const { start_date, end_date, max_amount, min_amount, transaction_type, transaction_method, branch_code } = req.body;
    const { id: employeeId } = req.user;
    try {
        const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
        // Assign default values for null or undefined parameters
        const startDate = start_date || null;
        const endDate = end_date || null;
        const maxAmount = max_amount || null;
        const minAmount = min_amount || null;
        const transactionType = transaction_type || null;
        const transactionMethod = transaction_method || null;

        const result = await ReportModel.GetTransactionReport(startDate, endDate, maxAmount, minAmount, transactionType, transactionMethod, branchCode);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const GetTransactionOverallReportController = async (req, res) => {
    const { start_date, end_date, transaction_type, transaction_method, branch_code, report_period } = req.body;
    const { id: employeeId } = req.user;
    try {
        // Assign default values for null or undefined parameters
        const branchCode = await EmployeeModel.getEmployeeBranch(employeeId);
        const startDate = start_date || null;
        const endDate = end_date || null;
        const transactionType = transaction_type || null;
        const transactionMethod = transaction_method || null;
        const reportPeriod = report_period || null;

        const result = await ReportModel.GetTransactionOverallReport(startDate, endDate, transactionType, transactionMethod, branchCode, reportPeriod);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export {
    GetLoanReportController,
    GetOverallLoanReportController,
    GetOverallLateLoanReportController,
    GetTransactionReportController,
    GetTransactionOverallReportController
};