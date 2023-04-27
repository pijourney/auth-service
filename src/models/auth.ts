import { Jwt, JwtPayload } from "jsonwebtoken";

export interface Token extends Jwt {
  id: number;
  username: string;
  email: string;
  roleId: number;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
export const loginValidationRules = {
  username: { type: "string", empty: false },
  password: { type: "string", empty: false },
};
export type LoginRequest = {
  username: string;
  password: string;
};
export const registerValidationRules = {
  username: { type: "string", empty: false },
  email: { type: "email", empty: false },
  password: { type: "string", empty: false },
  passwordConfirmation: { type: "equal", field: "password" },
};
export type RegisterReqeuest = {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};
