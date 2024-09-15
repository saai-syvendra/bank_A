import express from "express";
import FdController from "../controllers/FdController.js";

const router = express.Router();

router.get("/get-all", FdController.getCustomerFds);

export default router;
