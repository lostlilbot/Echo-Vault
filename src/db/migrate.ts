import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema";

const db = drizzle(process.env.DATABASE_URL || "./echovault.db", { schema });

async function run() {
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migrations applied successfully");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

run();


