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

router.get("/plans", LoanController.getLoanPlans);

export default router;
