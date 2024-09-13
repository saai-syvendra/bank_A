import express from "express";
import CustomerController from "../controllers/CustomerController.js";
import { authorizeRole } from "../middleware/auth.js";
import { validateCreateCustomer } from "../middleware/validations.js";

const router = express.Router();

router.get(
    "/",
    authorizeRole("employee", "manager"),
    CustomerController.getCustomer
);

router.get(
    "/all-names",
    authorizeRole("employee", "manager"),
    CustomerController.getCustomerNames
);

router.post(
    "/create",
    authorizeRole("employee", "manager"),
    validateCreateCustomer,
    CustomerController.createCustomer
);

export default router;
