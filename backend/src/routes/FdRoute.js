import express from "express";
import FdController from "../controllers/FdController.js";
import { authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/my-fds",
  authorizeRole("customer"),
  FdController.getThisCustomerFds
);

router.get("/plans", FdController.getFdPlans);

router.post("/create", authorizeRole("customer"), FdController.createFd);

router.get("/account-fds", FdController.getFDsForThisAccount);

router.get(
  "/branch-fds",
  authorizeRole("employee", "manager"),
  FdController.getBranchFdSummary
);

export default router;
