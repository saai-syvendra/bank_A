import express from "express";
import EmployeeController from "../controllers/EmployeeController.js";
import { authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get(
    "/detail",
    authorizeRole("employee", "manager"),
    EmployeeController.getEmployeeDetail
);

router.put(
    "/update",
    authorizeRole("employee", "manager"),
    EmployeeController.updateEmployeeDetail
);

export default router;
