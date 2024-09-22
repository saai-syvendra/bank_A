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
    "/my-transactions/:user",
    authorizeRole("customer"),
    AccountController.getThisCustomerAccountTransactions
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
    "/",
    authorizeRole("employee", "manager"),
    AccountController.getAccountDetails
);

router.get(
    "/:customerId",
    authorizeRole("employee", "manager"),
    AccountController.getCustomerAccounts
);

// router.get(
//     "/get-ATM-info",
//     authorizeRole("employee", "manager"),
//     AccountController.getATMinformation
// );


export default router;
