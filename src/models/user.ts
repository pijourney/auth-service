export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  roleId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserWithRoleAndPermissions extends User {
  permissions?: string[];
}

export interface UserWithResetToken extends User {
  reset_token?: string;
  reset_token_expires?: Date;
}
export type UserResponseModel =
  | Omit<UserWithRoleAndPermissions, "password">
  | Omit<User, "password">;

export type UpdateUserRequest = {
  username: string;
  email: string;
};
