import express from "express";
import FdController from "../controllers/FdController.js";
import { authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get(
    "/my-fds",
    authorizeRole("customer"),
    FdController.getThisCustomerFds
);

export default router;
