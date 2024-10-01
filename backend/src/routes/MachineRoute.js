import express from "express";
import MachineController from "../controllers/MachineController.js";

const router = express.Router();

router.get("/get-cdm-info", MachineController.getCDMinformation);

router.post("/cdm-deposit", MachineController.makeCDMdeposit);

export default router;
