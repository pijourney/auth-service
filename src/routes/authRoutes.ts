import express from "express";
import {
  signup,
  login,
  resetPassword,
  requestPasswordReset,
  verifyToken,
} from "../controllers";
import {
  jwtAuth,
  loginValidationMiddleware,
  registerValidationMiddleware,
} from "../middleware/authMiddleware";

export const authRoutes = express.Router();

authRoutes.post("/register", registerValidationMiddleware, signup);
authRoutes.post("/login", loginValidationMiddleware, login);
authRoutes.post("/request-password-reset", requestPasswordReset);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/verify-token", jwtAuth, verifyToken);
