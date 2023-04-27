import { db } from "../src/repositorys";
import "@jest/globals";
const tablesToClean = ["users", "phantom_tokens"];

export const clearDatabaseTables = async () => {
  await db.begin(async (sql) => {
    for (const table of tablesToClean) {
      const res = await sql.unsafe(`DELETE FROM ${table}`);
    }
  });
};
