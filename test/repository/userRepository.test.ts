import {
  UpdateUserRequest,
  User,
  UserWithRoleAndPermissions,
} from "../../src/models";
import bcrypt from "bcrypt";
import {
  createUser,
  deleteUserFromDatabase,
  getAllUsersFromDatabase,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  getUserByResetToken,
  savePasswordResetToken,
  updateUserDb,
  updateUserPasswordAndClearResetToken,
  updateUserRole,
} from "../../src/repositorys";
import { randomUUID } from "node:crypto";
import { clearDatabaseTables } from "../dbReset";

export const testUser: User = {
  username: "testuser",
  email: "testuser@example.com",
  password: "testpassword",
  roleId: 1,
};
let createdUser: UserWithRoleAndPermissions;

describe("User repository functions", () => {
  beforeEach(async () => {
    // Insert test user into database
    const result = await createUser(testUser);
    testUser.id = result?.id as number;
    testUser.createdAt = result?.createdAt as Date;
    testUser.updatedAt = result?.updatedAt as Date;
    if (result) createdUser = result;
  });
  afterEach(async () => {
    await clearDatabaseTables();
  });

  afterAll(async () => {
    await clearDatabaseTables();
  });

  describe("getUserByUsername", () => {
    it("should return a user by username", async () => {
      const user = await getUserByUsername(testUser.username);
      expect(user?.username).toBe(testUser.username);
    });

    it("should return undefined if user is not found", async () => {
      const user = await getUserByUsername("nonexistentuser");
      expect(user).toBeUndefined();
    });
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      if (!testUser.id) fail("testUser has no id ");
      const user = await getUserById(testUser.id);
      expect(user?.id).toBe(testUser.id);
    });

    it("should return undefined if user is not found", async () => {
      const user = await getUserById(-1);
      expect(user).toBeUndefined();
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const newUser: User = {
        username: "newuser",
        email: "newuser@example.com",
        password: "newpassword",
        roleId: 2,
      };

      const result = await createUser(newUser);
      expect(result?.username).toBe(newUser.username);
      expect(result?.email).toBe(newUser.email);
      expect(result?.password).toBe(newUser.password);
      expect(result?.roleId).toBe(newUser.roleId);
      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      await deleteUserFromDatabase(Number(result?.id));
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      const user = await getUserByEmail(testUser.email);
      expect(user?.email).toBe(testUser.email);
    });

    it("should return undefined if user is not found", async () => {
      const user = await getUserByEmail("nonexistentuser@example.com");
      expect(user).toBeUndefined();
    });
  });

  describe("savePasswordResetToken", () => {
    it("should save a password reset token for a user", async () => {
      const resetToken = randomUUID();
      const expiresIn = new Date(Date.now() + 1000 * 60 * 60 * 24);
      if (!testUser.id) fail("testUser has no id ");

      await savePasswordResetToken(testUser.id, resetToken, expiresIn);

      const user = await getUserByResetToken(resetToken);

      expect(user?.id).toBe(user?.id);
    });
  });

  describe("updateUserDb", () => {
    it("should update user email", async () => {
      if (!testUser.id) fail("testUser has no id ");
      // Update the user's email
      const newEmail = "newemail@example.com";
      const updatedUser = await updateUserDb(testUser?.id, {
        email: newEmail,
        username: testUser.username,
      } as UpdateUserRequest);

      // Check that the user's email has been updated in the database
      const user = await getUserById(testUser?.id);
      expect(user?.email).toEqual(newEmail);
    });

    it("should return the updated user username", async () => {
      if (!testUser.id) fail("testUser has no id ");
      // Update the user's email
      const newUsername = "prickigkorv";
      const updatedUser = await updateUserDb(testUser.id, {
        username: newUsername,
        email: testUser.email,
      });
      // Check that the user's email has been updated in the database
      const user = await getUserById(testUser?.id);
      expect(user?.username).toEqual(newUsername);
    });
  });

  describe("getAllUsersFromDatabase", () => {
    it("should return all users in the database", async () => {
      const users = await getAllUsersFromDatabase();

      expect(users).toHaveLength(1); // Make sure there's only one user
      expect(users[0]).toMatchObject(createdUser); // Make sure the user matches the inserted test user
    });
    it("should return get more then 1 user from the database", async () => {
      const insertedUser: User = {
        username: "inserteduser",
        email: "ball@ball.com",
        password: "testpassword",
        roleId: 1,
      };
      const result = await createUser(insertedUser);
      const users = await getAllUsersFromDatabase();
      expect(users).toHaveLength(2); // Make sure there's only one user
      expect(users).toContainEqual(result);
      expect(users).toContainEqual(createdUser);
    });
  });
  describe("updateUserPasswordAndClearResetToken", () => {
    test("should update user password and clear reset token", async () => {
      if (!testUser.id) fail("testUser has no id");
      // Then, generate a password reset token and save it for the test user
      const resetToken = randomUUID();
      const expiresIn = new Date(Date.now() + 3600000); // Expires in 1 hour
      await savePasswordResetToken(testUser.id, resetToken, expiresIn);

      // Use the reset token to update the test user's password
      const newPassword = "newpassword";
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await updateUserPasswordAndClearResetToken(testUser.id, hashedPassword);

      // Check that the test user's password has been updated
      const updatedUser = await getUserById(testUser.id);
      if (!updatedUser) fail("Could not find updatedUser");
      const isPasswordValid = await bcrypt.compare(
        newPassword,
        updatedUser.password
      );
      expect(isPasswordValid).toBe(true);

      // Check that the test user's reset token has been cleared
      const userWithResetToken = await getUserByResetToken(resetToken);
      expect(userWithResetToken).toBeUndefined();
    });
  });

  describe("updateUserRole", () => {
    it("should update user role successfully", async () => {
      if (!testUser.id) fail("testUser has no id");
      const updatedUser = await updateUserRole(testUser.id, 2);
      expect(updatedUser.roleId).toBe(2);

      // Verify that the user has been updated in the database
      const updatedRoleuser = await getUserById(testUser.id);
      if (!updatedRoleuser) fail("Could not find updatedRoleuser");
      expect(updatedRoleuser.roleId).toBe(2);
    });

    it("should throw an error when no user is found", async () => {
      const nonExistentUserId = 9999;
      await expect(updateUserRole(nonExistentUserId, 2)).rejects.toThrow(
        `Could not update user with id:${nonExistentUserId}`
      );
    });

    it("should throw an error when update fails", async () => {
      if (!testUser.id) fail("testUser has no id");
      // Attempt to update the user with an invalid role ID (i.e. one that doesn't exist)
      await expect(updateUserRole(testUser.id, 9999)).rejects.toThrow(
        `Could not update user with id:${testUser.id}`
      );
    });
  });
});
