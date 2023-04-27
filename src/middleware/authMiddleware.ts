import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  LoginRequest,
  RegisterReqeuest,
  Token,
  loginValidationRules,
  registerValidationRules,
} from "../models";
import { getJwtTokenByPhantomToken } from "../repositorys";
import { validateRequest } from "./validator";
import { ValidationError } from "fastest-validator";

export interface IRequestWithUser extends Request {
  user?: Token;
}

export const jwtAuth = async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
  } else {
    const token = authHeader.split("Bearer ")[1];
    if (!token) res.status(401).json({ message: "No token in request" });
    const jwtToken = await getJwtTokenByPhantomToken(token);
    if (!jwtToken) {
      res.status(401).json({ message: "Invalid token" });
    }
    try {
      const user = jwt.verify(
        jwtToken as string,
        process.env.JWT_SECRET_KEY as string
      ) as Token;
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Invalid token" });
    }
  }
};
export const requireAdmin = async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as Token;
  if (user.roleId !== 1) {
    res.status(401).json({ message: "Unauthorized" });
  } else {
    next();
  }
};
// Middleware function to validate login request
export const loginValidationMiddleware = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    await validateRequest(req.body, loginValidationRules);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Middleware function to validate register request
export const registerValidationMiddleware = async (
  req: Request<{}, {}, RegisterReqeuest>,
  res: Response,
  next: NextFunction
) => {
  try {
    await validateRequest(req.body, registerValidationRules);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
