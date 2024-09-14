import express from "express";
import UserController from "../controllers/UserController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", UserController.login);
router.post("/login/otp", UserController.loginOtp);
router.post("/logout", UserController.logout);
router.post("/verify", UserController.verify);
router.post("/auth", authenticateJWT, UserController.authUser);
router.post("/exp", UserController.userExpiration);

export default router;
