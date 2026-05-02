import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const db = drizzle(process.env.DATABASE_URL || "./echovault.db", { schema });

export { db };

