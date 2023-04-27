import Docker from "dockerode";
import * as fs from "fs";
import postgres from "postgres";

const dbUsername = process.env.DB_USERNAME || "username";
const dbPassword = process.env.DB_PASSWORD || "password";
const dbName = process.env.DB_NAME || "database";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || "5432");
const initSqlScript =
  process.env.INIT_SQL_SCRIPT || "./resources/database/schema.sql";

export default async (_config: any) => {
  const docker = new Docker();
  // Start a Docker container with a PostgreSQL database
  console.log(
    "Starting Postgresql container using dbUsername: " +
      dbUsername +
      " dbPassword: " +
      dbPassword +
      " dbName: " +
      dbName
  );
  const containerConfig = {
    Image: "postgres",
    Env: [
      `POSTGRES_USER=${dbUsername}`,
      `POSTGRES_PASSWORD=${dbPassword}`,
      `POSTGRES_DB=${dbName}`,
    ],
    ExposedPorts: { "5432/tcp": {} },
    HostConfig: {
      PortBindings: { "5432/tcp": [{ HostPort: "5432" }] },
    },
  };
  const container = await docker.createContainer(containerConfig);
  const started = await container.start();
  console.log(started);
  console.log("Postgresql container started");

  console.log("Created Pool connection to db");
  const pool = postgres({
    host: dbHost,
    database: dbName,
    user: dbUsername,
    password: dbPassword,
    port: dbPort,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || "20", 10),
    idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
  });
  process.env.containerid = container.id;
  // Wait for the database to start up
  await waitForDatabase(pool);
  await runSqlScript(initSqlScript, pool);
  await pool.end();
};
async function waitForDatabase(sql: postgres.Sql) {
  let retries = 10;
  while (retries) {
    try {
      console.log("Trying to connect to database...");
      await sql`SELECT NOW()`;
      console.log("Database is ready!");
      return;
    } catch (err) {
      console.error("Failed to connect to database, retrying...");
      retries--;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error("Unable to connect to database");
}
async function runSqlScript(path: string, sql: postgres.Sql) {
  console.log("Running SQL script");
  const query = fs.readFileSync(path).toString();
  await sql`${query}`;
}
