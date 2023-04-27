import { IRequestWithUser } from "../middleware";
import { Request, Response } from "express";

import {
  Token,
  UpdateUserRequest,
  UserResponseModel,
  UserWithRoleAndPermissions,
} from "../models";
import { getUserById } from "../repositorys";
import {
  changeUserRole,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../services/userService";

// Get user profile
export const getUserHandler = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId)
    return res
      .status(401)
      .json({ message: "Invalid request, please provide a userId" });

  const user = await getUserById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
  } else {
    const resposne = userToUserResponse(user);
    res.json(resposne);
  }
};

// Update user profile
export const updateUserHandler = async (
  req: IRequestWithUser,
  res: Response
) => {
  const userId = getUserId(req);

  const user = req.body as UpdateUserRequest;
  const token = req.user as Token;

  if (userId !== token.id)
    return res.status(401).json({ message: "Unauthorized" });

  const updatedUser = await updateUser(userId, user);

  if (!updatedUser) {
    res.status(500).json({ message: "Error updating user data" });
  } else {
    const resposne = userToUserResponse(updatedUser);
    res.json(resposne);
  }
};

// Delete user account
export const deleteUserHandler = async (
  req: IRequestWithUser,
  res: Response
) => {
  const user = req.user as Token;
  const userId = getUserId(req);
  if (userId !== user.id)
    return res.status(401).json({ message: "Unauthorized" });

  const result = await deleteUser(user.id);
  if (result.success) {
    res.status(200).json({ message: "User account deleted successfully" });
  } else {
    res.status(500).json({ message: "Error deleting user account" });
  }
};

// List all users (for admin)
export const listUsersHandler = async (
  req: IRequestWithUser,
  res: Response
) => {
  const token = req.user as Token;
  try {
    const users = await getAllUsers();
    const resposne = { users: users.map((user) => userToUserResponse(user)) };
    res.status(200).json(resposne);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ message: "Error getting all users" });
  }
};

// Update user role (for admin)
export const updateUserRole = async (req: IRequestWithUser, res: Response) => {
  const userId = getUserId(req);
  const newRoleId = getRoleId(req);
  if (!userId || !newRoleId)
    return res.status(401).json({ message: "Invalid request" });

  try {
    const updatedUser = await changeUserRole(userId, newRoleId);
    const resposne = userToUserResponse(updatedUser);
    res.status(200).json(resposne);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Error updating user role" });
  }
};

const getUserId = (req: Request) => {
  const userId = parseInt(req.params.id, 10);
  return userId;
};
const getRoleId = (req: Request) => {
  const userId = parseInt(req.params.role_id, 10);
  return userId;
};

const userToUserResponse = (
  user: UserWithRoleAndPermissions
): UserResponseModel => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as UserResponseModel;
};
