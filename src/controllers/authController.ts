import { Request, Response, NextFunction } from "express";
import {
  createHttpError,
  LoginRequest,
  RegisterReqeuest,
  Token,
  User,
  UserResponseModel,
  UserWithRoleAndPermissions,
} from "../models";
import { IRequestWithUser } from "../middleware/authMiddleware";
import {
  createNewUser,
  generateToken,
  tryLogin,
  tryRequestPasswordReset,
  tryResetPassword,
} from "../services";

export async function signup(req: Request, res: Response, next: NextFunction) {
  const { username, email, password, passwordConfirmation } =
    req.body as RegisterReqeuest;

  const user = await createNewUser({
    username,
    email,
    password,
    roleId: 3,
  } as User);
  if (!user) {
    return next(createHttpError(500, "Something went wrong, please try again"));
  }
  // Generate JWT token
  const token = generateToken(user);
  const userResponse = userToUserResponse(user);
  res.setHeader("Authorization", "Bearer " + token);
  res.status(201).json({ userResponse });
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body as LoginRequest;

  try {
    const { user, phantomToken } = await tryLogin(username, password);
    if (!user || !phantomToken) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    const userResponse = userToUserResponse(user);
    res.setHeader("Authorization", "Bearer " + phantomToken);
    res.status(200).json({ userResponse });
  } catch (error: any) {
    console.log(`Error when logging in user=${username} error=${error}`);
    next(error);
  }
}

export const verifyToken = (req: IRequestWithUser, res: Response): void => {
  const user = req.user as Token;
  res.json({ user });
};

export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await tryRequestPasswordReset(req.body.email);
  if (result.success) {
    res.status(200).json({ message: "Password reset email sent" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await tryResetPassword(
    req.body.resetToken,
    req.body.newPassword
  );
  if (result.success) {
    res.status(200).json({ message: "Password updated successfully" });
  } else {
    res.status(401).json({ message: "Invalid or expired reset token" });
  }
};

const userToUserResponse = (
  user: UserWithRoleAndPermissions
): UserResponseModel => {
  var userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as UserResponseModel;
  return userResponse;
};
