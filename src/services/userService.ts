import { UpdateUserRequest, User, UserWithRoleAndPermissions } from "../models";
import {
  deleteUserFromDatabase,
  getAllUsersFromDatabase,
  updateUserDb,
  updateUserRole,
} from "../repositorys";

export const updateUser = async (
  userId: number,
  updateUser: UpdateUserRequest
) => {
  const user = await updateUserDb(userId, updateUser);

  return user;
};

export const deleteUser = async (
  userId: number
): Promise<{ success: boolean }> => {
  try {
    await deleteUserFromDatabase(userId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false };
  }
};

export const getAllUsers = async (): Promise<UserWithRoleAndPermissions[]> => {
  const users = await getAllUsersFromDatabase();

  return users;
};

export const changeUserRole = async (
  userId: number,
  role_id: number
): Promise<User> => {
  const updatedUser = await updateUserRole(userId, role_id);
  return updatedUser;
};
