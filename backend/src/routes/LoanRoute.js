import express from "express";
import LoanController from "../controllers/LoanController.js";
import { authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/create",
  authorizeRole("employee", "manager"),
  LoanController.createLoan
);

router.post(
  "/create-online",
  authorizeRole("customer"),
  LoanController.createOnlineLoan
);

router.get(
  "/approval-pending",
  authorizeRole("manager"),
  LoanController.getApprovalPendingLoans
);

router.get(
  "/upcoming-installments",
  authorizeRole("customer"),
  LoanController.getUpcomingInstallments
);

router.post(
  "/pay-installment",
  authorizeRole("customer"),
  LoanController.payInstallment
);

router.post("/approve", authorizeRole("manager"), LoanController.approveLoan);

router.post("/reject", authorizeRole("manager"), LoanController.rejectLoan);

router.get("/plans", LoanController.getLoanPlans);

router.get(
  "/late-installments",
  authorizeRole("manager"),
  LoanController.getLateLoanInstallments
);

router.get(
  "/loan-customers",
  authorizeRole("manager"),
  LoanController.getLoanCustomers
);

router.get(
  "/account-loans",
  authorizeRole("customer"),
  LoanController.getLoansForThisAccount
)

export default router;
