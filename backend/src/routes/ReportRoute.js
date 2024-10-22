import express from "express";
import {
    GetLoanReportController,
    GetOverallLoanReportController,
    GetOverallLateLoanReportController,
    GetTransactionReportController,
    GetTransactionOverallReportController
} from "../controllers/ReportController.js";

const router = express.Router();

router.post("/loan", GetLoanReportController);
router.post("/overall-loan", GetOverallLoanReportController);
router.post("/overall-late-loan", GetOverallLateLoanReportController);
router.post("/transaction", GetTransactionReportController);
router.post("/overall-transaction", GetTransactionOverallReportController);

export default router;


// Test routes and body examples for ReportRoute

/*
1. Get Loan Report
Route: http://localhost:3000/report/loan
Method: POST
Body: {
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "branch_code": 1
}

2. Get Overall Loan Report
Route: http://localhost:3000/report/overall-loan
Method: POST
Body: {
  "end_date": "2023-12-31",
  "state": "approved",
  "branch_code": 1,
  "report_frequency": "monthly"
}

3. Get Overall Late Loan Report
Route: http://localhost:3000/report/overall-late-loan
Method: POST
Body: {
  "end_date": "2023-12-31",
  "state": "approved",
  "branch_code": 1,
  "report_frequency": "weekly"
}

4. Get Transaction Report
Route: http://localhost:3000/report/transaction
Method: POST
Body: {
  "start_date": "2023-01-01T00:00:00",
  "end_date": "2023-12-31T23:59:59",
  "max_amount": 10000.00,
  "min_amount": 100.00,
  "transaction_type": "credit",
  "transaction_method": "online-transfer",
  "branch_code": 1
}

5. Get Transaction Overall Report
Route: http://localhost:3000/report/overall-transaction
Method: POST
Body: {
  "start_date": "2023-01-01T00:00:00",
  "end_date": "2023-12-31T23:59:59",
  "transaction_type": "credit",
  "transaction_method": "online-transfer",
  "branch_code": 1,
  "report_period": "monthly"
}
*/


