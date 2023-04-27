import { Token, User, UserWithRoleAndPermissions } from "../models";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "";

export const generateToken = (user: UserWithRoleAndPermissions) => {
  const { id, username, email, roleId, permissions, createdAt, updatedAt } =
    user;

  // Generate JWT token
  const token = jwt.sign(
    {
      id: id,
      username: username,
      email: email,
      roleId,
      permissions,
      createdAt: createdAt,
      updatedAt: updatedAt,
    } as Token,
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  return token;
};
