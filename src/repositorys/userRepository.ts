import { db } from "./db";
import { User, UserWithRoleAndPermissions, UpdateUserRequest } from "../models";

export const getUserByUsername = async (
  username: string
): Promise<UserWithRoleAndPermissions | undefined> => {
  const result = await db`
WITH role_permissions AS (
  SELECT roles.name AS role_name, permissions.name AS permission_name
  FROM roles
  JOIN role_permissions ON roles.id = role_permissions.role_id
  JOIN permissions ON role_permissions.permission_id = permissions.id
),
user_roles AS (
  SELECT users.id, roles.name AS role_name
  FROM users
  JOIN roles ON users.role_id = roles.id
),
user_permissions AS (
  SELECT user_roles.id, role_permissions.permission_name
  FROM user_roles
  JOIN role_permissions ON user_roles.role_name = role_permissions.role_name
)
SELECT 
users.id, 
users.username,
users.email,
users.password,
users.role_id AS "roleId",
users.created_at AS "createdAt",
users.updated_at AS "updatedAt",
array_agg(user_permissions.permission_name) AS permissions
FROM users
JOIN user_permissions ON users.id = user_permissions.id
WHERE users.username = ${username}
GROUP BY users.id;
`;
  if (!result || result.count === 0) return undefined;
  return rowToUserWithRoleAndPremissions(result.at(0));
};

export const getUserById = async (
  id: number
): Promise<UserWithRoleAndPermissions | undefined> => {
  const result = await db`
WITH role_permissions AS (
  SELECT roles.name AS role_name, permissions.name AS permission_name
  FROM roles
  JOIN role_permissions ON roles.id = role_permissions.role_id
  JOIN permissions ON role_permissions.permission_id = permissions.id
),
user_roles AS (
  SELECT users.id, roles.name AS role_name
  FROM users
  JOIN roles ON users.role_id = roles.id
),
user_permissions AS (
  SELECT user_roles.id, role_permissions.permission_name
  FROM user_roles
  JOIN role_permissions ON user_roles.role_name = role_permissions.role_name
)
SELECT 
users.id, 
users.username,
users.email,
users.password,
users.role_id AS "roleId",
users.created_at AS "createdAt",
users.updated_at AS "updatedAt",
array_agg(user_permissions.permission_name) AS permissions
FROM users
JOIN user_permissions ON users.id = user_permissions.id
WHERE users.id = ${id}
GROUP BY users.id;
`;
  if (!result || result.count === 0) return undefined;
  return rowToUserWithRoleAndPremissions(result.at(0));
};

export const createUser = async (
  user: User
): Promise<UserWithRoleAndPermissions | undefined> => {
  const { username, email, password, roleId } = user;
  const result = await db`WITH new_user AS (
    INSERT INTO users (username, email, password, role_id, created_at)
    VALUES (${username}, ${email}, ${password}, ${roleId}, ${new Date().toISOString()})
    RETURNING *
  )
  SELECT
    nu.id,
    nu.username,
    nu.email,
    nu.password,
    nu.role_id as "roleId",
    nu.created_at as "createdAt",
    nu.updated_at as "updatedAt",
    r.name as role,
    ARRAY_AGG(p.name) as permissions
  FROM new_user nu
  JOIN roles r ON r.id = nu.role_id
  JOIN role_permissions rp ON rp.role_id = r.id
  JOIN permissions p ON p.id = rp.permission_id
  GROUP BY nu.id, r.name, nu.username, nu.email, nu.password, nu.role_id, nu.created_at, nu.updated_at`;
  return rowToUserWithRoleAndPremissions(result.at(0));
};
export const getUserByEmail = async (
  email: string
): Promise<User | undefined> => {
  const result =
    await db`SELECT id, username, email, password, role_id as roleId, created_at as createdAt, updated_at as updatedAt FROM users WHERE email = ${email}`;
  if (result.count === 0) return undefined;
  return rowToUserWithRoleAndPremissions(result.at(0));
};

export const savePasswordResetToken = async (
  userId: number,
  resetToken: string,
  expiresIn: Date
): Promise<void> => {
  await db`UPDATE users SET reset_token = ${resetToken}, reset_token_expires = ${expiresIn.toISOString()}, updated_at = ${new Date().toISOString()} WHERE id = ${userId}`;
};

export const getUserByResetToken = async (
  resetToken: string
): Promise<User | undefined> => {
  const result =
    await db`SELECT id, username, email, password, role_id as roleId, created_at as createdAt FROM users WHERE reset_token = ${resetToken} AND reset_token_expires > NOW()`;
  if (result.count === 0) return undefined;
  return rowToUserWithRoleAndPremissions(result.at(0));
};

export const updateUserPasswordAndClearResetToken = async (
  userId: number,
  hashedPassword: string
): Promise<void> => {
  await db`UPDATE users SET password = ${hashedPassword}, reset_token = NULL, reset_token_expires = NULL, updated_at = ${new Date().toISOString()} WHERE id = ${userId}`;
};

export const updateUserDb = async (
  userId: number,
  updateUser: UpdateUserRequest
) => {
  const { username, email } = updateUser;

  const result = await db`
  UPDATE users
  SET
    username = COALESCE(${username}, username),
    email = COALESCE(${email}, email)
  WHERE id = ${userId}
  RETURNING *;
`;
  if (result.count === 0) return undefined;
  return rowToUserWithRoleAndPremissions(result.at(0));
};

export const deleteUserFromDatabase = async (userId: number): Promise<void> => {
  try {
    await db`DELETE FROM users WHERE id = ${userId}`;
  } catch (error) {
    console.error("Error executing deleteUser query:", error);
    throw error;
  }
};

export const getAllUsersFromDatabase = async (): Promise<
  UserWithRoleAndPermissions[]
> => {
  try {
    const result = await db`
  SELECT
    u.id,
    u.username,
    u.email,
    u.password,
    u.role_id as "roleId",
    u.created_at as "createdAt",
    u.updated_at as "updatedAt",
    r.name as role,
    ARRAY_AGG(p.name) as permissions
  FROM users u
  JOIN roles r ON r.id = u.role_id
  JOIN role_permissions rp ON rp.role_id = r.id
  JOIN permissions p ON p.id = rp.permission_id
  GROUP BY u.id, r.name
`;
    if (result.count === 0) return [];
    return result.map((row) =>
      rowToUserWithRoleAndPremissions(row)
    ) as UserWithRoleAndPermissions[];
  } catch (error) {
    console.error("Error executing getAllUsers query:", error);
    throw error;
  }
};

export const updateUserRole = async (
  id: number,
  role_id: number
): Promise<UserWithRoleAndPermissions> => {
  try {
    const result = await db`
WITH updated_user AS (
  UPDATE users SET role_id = ${role_id}, updated_at = NOW() WHERE id = ${id} RETURNING *
),
role_permissions AS (
  SELECT roles.name AS role_name, permissions.name AS permission_name
  FROM roles
  JOIN role_permissions ON roles.id = role_permissions.role_id
  JOIN permissions ON role_permissions.permission_id = permissions.id
),
user_roles AS (
  SELECT updated_user.id, roles.name AS role_name
  FROM updated_user
  JOIN roles ON updated_user.role_id = roles.id
),
user_permissions AS (
  SELECT user_roles.id, role_permissions.permission_name
  FROM user_roles
  JOIN role_permissions ON user_roles.role_name = role_permissions.role_name
)
SELECT 
updated_user.id, 
updated_user.username,
updated_user.email,
updated_user.password,
updated_user.role_id AS "roleId",
updated_user.created_at AS "createdAt",
updated_user.updated_at AS "updatedAt",
array_agg(user_permissions.permission_name) AS permissions
FROM updated_user
JOIN user_permissions ON updated_user.id = user_permissions.id
GROUP BY updated_user.id, updated_user.username, updated_user.email, updated_user.password, updated_user.role_id, updated_user.created_at, updated_user.updated_at;
`;
    if (result.count === 0) {
      console.error("NO user found with id:", id);
      throw new Error("NO user found with id:" + id);
    }

    return rowToUserWithRoleAndPremissions(result.at(0));
  } catch (error) {
    console.error("Error executing updateUserRole query:", error);
    throw new Error(`Could not update user with id:${id}`);
  }
};

const rowToUserWithRoleAndPremissions = (
  row: any
): UserWithRoleAndPermissions => {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    roleId: row.roleId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    permissions: row.permissions,
  };
};
