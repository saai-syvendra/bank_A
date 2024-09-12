import express from "express";
import AccountController from "../controllers/AccountController.js";
import { authenticateJWT, authorizeRole } from "../middleware/auth.js";
import { validateAccountRequest } from "../middleware/validations.js";

const router = express.Router();

router.post(
    "/",
    authenticateJWT,
    authorizeRole("employee", "manager"),
    validateAccountRequest,
    AccountController.createAccount
);

router.post("/test", AccountController.getCustomerAccounts);

export default router;
