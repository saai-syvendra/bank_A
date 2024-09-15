import express from "express";
import AccountController from "../controllers/AccountController.js";
import { authorizeRole } from "../middleware/auth.js";
import { validateAccountRequest } from "../middleware/validations.js";

const router = express.Router();

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

export default router;
