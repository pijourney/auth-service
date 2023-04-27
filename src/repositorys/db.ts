import postgres from "postgres";

export const db = postgres({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "20", 10),
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
});
