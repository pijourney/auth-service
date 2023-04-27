import type { Config } from "jest";
import dotenv from "dotenv";

dotenv.config({ path: ".test.env" });

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  testMatch: ["**/test/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  verbose: true,

  collectCoverage: true,
  collectCoverageFrom: ["**/src/**/*.ts"],
  coverageDirectory: "./test/coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["json", "lcov", "text", "text-summary"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  globalSetup: `./test/postgresqlSetup.ts`,
  globalTeardown: `./test/postgresqlTeardown.ts`,
};
export default config;
