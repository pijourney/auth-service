import express from "express";
import { jwtAuth, requireAdmin } from "../middleware/authMiddleware";
import {
  deleteUserHandler,
  getUserHandler,
  listUsersHandler,
  updateUserHandler,
  updateUserRole,
} from "../controllers";

export const userRoutes = express.Router();

userRoutes.get("/user/:id", jwtAuth, getUserHandler);
userRoutes.put("/user/:id", jwtAuth, updateUserHandler);
userRoutes.delete("/user/:id", jwtAuth, deleteUserHandler);
userRoutes.get("/users", jwtAuth, requireAdmin, listUsersHandler);
userRoutes.put(
  "/user/:id/role/:role_id",
  jwtAuth,
  requireAdmin,
  updateUserRole
);
