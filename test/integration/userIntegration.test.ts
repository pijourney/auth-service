import request from "supertest";
import app from "../../src/app";
import { clearDatabaseTables } from "../dbReset";
import {
  LoginRequest,
  RegisterReqeuest,
  UserResponseModel,
} from "../../src/models";
import { createNewUser } from "../../src/services";
const baseUrl = "/api";
const testUser = {
  username: "testuser",
  email: "testuser@example.com",
  password: "testpassword",
  passwordConfirmation: "testpassword",
} as RegisterReqeuest;
const testRole = {
  id: 1,
  name: "admin",
};
describe("User endpoints", () => {
  beforeEach(async () => {
    await clearDatabaseTables();
  });

  afterAll(async () => {
    await clearDatabaseTables();
  });
  describe("GET  /user/:id", () => {
    it("should return a user by ID", async () => {
      // First, create a test user
      const createUserResponse = await createUserRequestAndValidate(testUser);
      // Extract the user ID from the response

      const userId = createUserResponse.body.userResponse.id;
      // Then, log in as the test user to get a JWT token
      const loginResponse = await doLoginRequestAndValidate({
        username: testUser.username,
        password: testUser.password,
      });
      // Extract the JWT token from the response
      const token = loginResponse.header.authorization
        .toString()
        .split("Bearer ")[1];
      // Use the token to make an authenticated request to get the test user's data
      const getUserResponse = await doGetUserRequestAndValidate(
        userId,
        token,
        200
      );
      // Assert that the response contains the expected user data
      expect(getUserResponse.body.username).toBe(testUser.username);
      expect(getUserResponse.body.email).toBe(testUser.email);
    });

    it("should return 404 if user not found", async () => {
      // First, create a test user
      await createUserRequestAndValidate(testUser);
      // Create a fake user ID that doesn't exist
      const fakeUserId = 12345;
      // Then, log in as an existing user to get a JWT token
      const loginResponse = await doLoginRequestAndValidate({
        username: testUser.username,
        password: testUser.password,
      } as LoginRequest);
      // Extract the JWT token from the response

      const token = loginResponse.header.authorization
        .toString()
        .split("Bearer ")[1];
      // Use the token to make an authenticated request to get the non-existent user's data
      const getUserResponse = await doGetUserRequestAndValidate(
        fakeUserId,
        token,
        404
      );
      // Assert that the response contains the expected error message
      expect(getUserResponse.body.message).toBe("User not found");
    });
  });
  describe("DELETE /user/:id", () => {
    it("should delete a user by ID", async () => {
      // First, create a test user
      const createUserResponse = await createUserRequestAndValidate(testUser);
      // Extract the user ID from the response
      const userId = createUserResponse.body.userResponse.id;
      // Then, log in as the test user to get a JWT token
      const loginResponse = await doLoginRequestAndValidate({
        username: testUser.username,
        password: testUser.password,
      });
      // Extract the JWT token from the response
      const token = loginResponse.header.authorization
        .toString()
        .split("Bearer ")[1];
      // Use the token to make an authenticated request to delete the test user
      const deleteUserResponse = await doDeleteUserRequestAndValidate(
        userId,
        token,
        200
      );
      // Assert that the response contains the expected success message
      expect(deleteUserResponse.body.message).toBe(
        "User account deleted successfully"
      );
    });

    it("should return 401 if trying to delete another user", async () => {
      // First, create a test user
      await createUserRequestAndValidate(testUser);
      // Create a fake user ID that doesn't exist
      const fakeUserId = 12345;
      // Then, log in as an existing user to get a JWT token
      const loginResponse = await doLoginRequestAndValidate({
        username: testUser.username,
        password: testUser.password,
      });
      // Extract the JWT token from the response
      const token = loginResponse.header.authorization
        .toString()
        .split("Bearer ")[1];
      // Use the token to make an authenticated request to delete the non-existent user
      const deleteUserResponse = await doDeleteUserRequestAndValidate(
        fakeUserId,
        token,
        401
      );
      // Assert that the response contains the expected error message
      expect(deleteUserResponse.body.message).toBe("Unauthorized");
    });
  });
  describe("GET /users", () => {
    it("should return all users", async () => {
      // First, create a test users
      await createUserRequestAndValidate(testUser);

      var user = await createNewUser({
        username: "adam",
        email: "admin@admin.se",
        password: "123",
        roleId: testRole.id,
      });
      if (user == null) {
        fail("user is null");
      }
      // Then, log in as the test user to get a JWT token
      const loginResponse = await doLoginRequestAndValidate({
        username: "adam",
        password: "123",
      } as LoginRequest);

      // Extract the JWT token from the response
      const token = loginResponse.header.authorization
        .toString()
        .split("Bearer ")[1];
      // Use the token to make an authenticated request to get all users
      const getUsersResponse = await doGetAllUsersRequestAndValidate(
        token,
        200
      );

      // Assert that the response contains at least one user
      expect(getUsersResponse.body.users.length).toBeGreaterThanOrEqual(1);
      // Assert that the response contains the test user's data
      const testUserData = getUsersResponse.body.users.find(
        (user: UserResponseModel) => user.username === testUser.username
      );
      expect(testUserData).toBeDefined();
      expect(testUserData.email).toBe(testUser.email);
    });

    it("should return 401 if not authenticated", async () => {
      // Make an unauthenticated request to get all users
      const getUsersResponse = await doGetAllUsersRequestAndValidate("", 401);
      // Assert that the response contains the expected error message
      expect(getUsersResponse.body.message).toBe("No token provided");
    });
  });
  describe("PUT /user/:id/role/:role_id", () => {
    it("should update a user's role", async () => {
      await createUserRequestAndValidate(testUser);
      // First, create a test user
      var user = await createNewUser({
        username: "adam",
        email: "admin@admin.se",
        password: "123",
        roleId: testRole.id,
      });
      if (user == null) {
        fail("user is null");
      }
      // Then, log in as the test user to get a JWT token
      const loginResponse = await doLoginRequestAndValidate({
        username: "adam",
        password: "123",
      } as LoginRequest);

      // Extract the JWT token from the response
      const token = loginResponse.header.authorization
        .toString()
        .split("Bearer ")[1];
      const getUsersResponse = await doGetAllUsersRequestAndValidate(
        token,
        200
      );
      const testUserData = getUsersResponse.body.users.find(
        (user: UserResponseModel) => user.username === testUser.username
      );
      // Use the token to make an authenticated request to update the test user's role
      const updateRoleResponse = await doUpdateUserRoleRequestAndValidate(
        testUserData.id,
        testRole.id,
        token,
        200
      );
      // Assert that the response contains the updated user data with the new role
      expect(updateRoleResponse.body.roleId).toBe(testRole.id);
      expect(updateRoleResponse.body.id).toBe(testUserData.id);
    });
  });
  const doUpdateUserRoleRequestAndValidate = async (
    userId: number,
    roleId: number,
    token: string,
    expectStatus: number
  ) => {
    const updateRoleResponse = await request(app)
      .put(`${baseUrl}/user/${userId}/role/${roleId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectStatus);
    return updateRoleResponse;
  };
  const createUserRequestAndValidate = async (testUser: RegisterReqeuest) => {
    const createUserResponse = await request(app)
      .post(`${baseUrl}/auth/register`)
      .send(testUser)
      .expect(201);
    return createUserResponse;
  };

  const doLoginRequestAndValidate = async (loginRequest: LoginRequest) => {
    const loginResponse = await request(app)
      .post(`${baseUrl}/auth/login`)
      .send({
        username: loginRequest.username,
        password: loginRequest.password,
      })
      .expect(200);
    expect(loginResponse.header.authorization).toBeDefined();
    expect(loginResponse.body.userResponse.username).toEqual(
      loginRequest.username
    );
    return loginResponse;
  };

  const doGetUserRequestAndValidate = async (
    userId: number,
    token: string,
    expectStatus: number
  ) => {
    const getUserResponse = await request(app)
      .get(`${baseUrl}/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectStatus);
    return getUserResponse;
  };
  const doDeleteUserRequestAndValidate = async (
    userId: number,
    token: string,
    expectStatus: number
  ) => {
    const deleteUserResponse = await request(app)
      .delete(`${baseUrl}/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectStatus);
    return deleteUserResponse;
  };
  const doGetAllUsersRequestAndValidate = async (
    token: string,
    expectStatus: number
  ) => {
    const getUsersResponse = await request(app)
      .get(`${baseUrl}/users`)
      .set("Authorization", token ? `Bearer ${token}` : "")
      .expect(expectStatus);
    return getUsersResponse;
  };
});
