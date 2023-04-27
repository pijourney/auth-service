import {
  createUser,
  getUserByEmail,
  getUserByResetToken,
  getUserByUsername,
  savePasswordResetToken,
  savePhantomToken,
  updateUserPasswordAndClearResetToken,
} from "../repositorys";
import { User, UserWithRoleAndPermissions } from "../models";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "./tokenService";

export const createNewUser = async ({
  username,
  email,
  password,
  roleId,
}: User) => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user: UserWithRoleAndPermissions | undefined = await createUser({
      username,
      email: email,
      password: hashedPassword,
      roleId,
    } as User);
    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const tryLogin = async (username: string, password: string) => {
  const user: UserWithRoleAndPermissions | undefined = await getUserByUsername(
    username
  );

  if (!user || user === undefined) {
    console.log(`User not found with username: ${username}`);
    return { user: undefined, token: undefined };
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid === false) {
    console.log(`User with: ${username} has entered an invalid password`);
    return { user: undefined, token: undefined };
  }

  // Generate and store a phantom token
  const phantomToken = uuidv4();
  const token = generateToken(user);
  await savePhantomToken(phantomToken, token);
  return { user, phantomToken };
};

export const tryRequestPasswordReset = async (
  email: string
): Promise<{ success: boolean }> => {
  const user = await getUserByEmail(email);

  if (!user || !user.id) {
    return { success: false };
  }

  const resetToken = uuidv4();
  const expiresIn = new Date();
  expiresIn.setHours(expiresIn.getHours() + 1); // Token expires in 1 hour

  await savePasswordResetToken(user.id, resetToken, expiresIn);

  // Send reset token via email service
  //await sendPasswordResetEmail(user.email, user.username, resetToken);

  return { success: true };
};

export const tryResetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean }> => {
  // Verify the token and get the user
  const user = await getUserByResetToken(resetToken);

  if (!user || !user.id) {
    return { success: false };
  }

  // Update the user's password and clear the reset token
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPasswordAndClearResetToken(user.id, hashedPassword);

  return { success: true };
};
