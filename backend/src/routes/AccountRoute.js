import express from "express";
import AccountController from "../controllers/AccountController.js";
import { authorizeRole } from "../middleware/auth.js";
import { validateAccountRequest } from "../middleware/validations.js";

const router = express.Router();

router.get(
  "/my-accounts",
  authorizeRole("customer"),
  AccountController.getThisCustomerAccounts
);

router.get(
  "/my-transactions",
  authorizeRole("customer"),
  AccountController.getThisCustomerAccountTransactions
);

router.get(
  "/branch-transactions",
  authorizeRole("employee", "manager"),
  AccountController.getThisBranchAccountTransactions
);

router.get(
  "/branch-accounts",
  authorizeRole("employee", "manager"),
  AccountController.getBranchAccounts
);

router.post(
  "/create",
  authorizeRole("employee", "manager"),
  validateAccountRequest,
  AccountController.createAccount
);

router.get(
  "/saving-plans",
  authorizeRole("employee", "manager"),
  AccountController.getSavingPlans
);

router.get(
  "/get-atm-info",
  authorizeRole("customer"),
  AccountController.getATMinformation
);

router.get(
  "/branch-customers", 
  authorizeRole("employee", "manager"),
  AccountController.getbranchCustomers 
);

router.get(
  "/",
  authorizeRole("employee", "manager"),
  AccountController.getAccountDetails
);

router.get(
  "/:customerId",
  authorizeRole("employee", "manager"),
  AccountController.getCustomerAccounts
);

router.post(
  "/get-account-id",
  authorizeRole("employee", "manager"),
  AccountController.getAccountIDByAccountNo
);


export default router;
