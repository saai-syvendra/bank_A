import express from "express";
import TransactionController from "../controllers/TransactionController.js";
import { authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// Employee making deposit on behalf of customer
router.post(
  "/employee/make-deposit",
  authorizeRole("employee"),
  TransactionController.employeeDepositForCustomerController
);

// // ATM deposit by customer
// router.post(
//     "/atm/deposit",
//     authorizeRole("customer"),
//     TransactionController.depositViaATM
// );

export default router;
