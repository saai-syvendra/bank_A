import express from "express";
import TransactionController from "../controllers/TransactionController.js";
import { authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// Employee making deposit on behalf of customer
router.post(
  "/employee/make-deposit",
  authorizeRole("employee", "manager"),
  TransactionController.employeeDepositForCustomerController
);


//Make online transfer
router.post(
  "/online-transfer",
  authorizeRole("customer"),
  TransactionController.makeOnlineTransfer
);

export default router;
