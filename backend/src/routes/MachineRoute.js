import express from "express";
import MachineController from "../controllers/MachineController.js";
// import { authenticateJWT, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/get-cdm-info", MachineController.getCDMinformation);

router.post(
  "/cdm-deposit",
  // authenticateJWT,
  // authorizeRole("machine"),
  MachineController.makeCDMdeposit
);

router.post(
  "/atm-withdrawal",
  // authenticateJWT,
  // authorizeRole("machine"),
  MachineController.makeATMWithdrawal
)

export default router;
