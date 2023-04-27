import {
  createUser,
  getJwtTokenByPhantomToken,
  savePhantomToken,
} from "../../src/repositorys";
import { randomUUID } from "node:crypto";
import { generateToken } from "../../src/services";
import { clearDatabaseTables } from "../dbReset";

let phantomToken: string;
let token: string;
let userId: number;
describe("PhantomTokenRepository", () => {
  beforeAll(async () => {
    // Create test user
    const result = await createUser({
      username: "testuser",
      email: "testuser@example.com",
      password: "testpassword",
      roleId: 1,
    });
    if (!result || !result.id) fail("Could not create test user");
    userId = Number(result.id);
    phantomToken = randomUUID();
    token = generateToken(result);
  });

  beforeEach(async () => {
    await savePhantomToken(phantomToken, token);
  });
  afterEach(async () => {
    await clearDatabaseTables();
  });

  afterAll(async () => {
    await clearDatabaseTables();
  });

  describe("getJwtTokenByPhantomToken", () => {
    it("should fetch a jwt from phantom token", async () => {
      const fetchedToken = await getJwtTokenByPhantomToken(phantomToken);

      expect(fetchedToken).toBe(token);
      expect(token).toBeTruthy();
    });
  });
});
