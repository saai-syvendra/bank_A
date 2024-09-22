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
//     "/withdraw",
//     authorizeRole("customer"),
//     TransactionController.withdrawFromATMController
// );

// router.post(
//     "/cdm-deposit",
//     authorizeRole("customer"),
//     TransactionController.cdmDepositController
//   );


// router.post(
//   "/online-transfer",
//   authorizeRole("customer"),
//   TransactionController.makeOnlineTransferController
// );

export default router;
