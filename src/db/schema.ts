import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

index("users_email_idx").on(users.email);

export const memories = sqliteTable("memories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pastebinUrl: text("pastebin_url").notNull(),
  pastebinKey: text("pastebin_key").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

index("memories_user_id_idx").on(memories.userId);

export const echoes = sqliteTable("echoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memoryId: integer("memory_id").notNull().references(() => memories.id, { onDelete: "cascade" }),
  insight: text("insight").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

index("echoes_memory_id_idx").on(echoes.memoryId);

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

index("tags_name_idx").on(tags.name);

export const tagAssignments = sqliteTable("tag_assignments", {
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  memoryId: integer("memory_id").notNull().references(() => memories.id, { onDelete: "cascade" }),
}, (table) => ({
  primaryKey: { columns: [table.tagId, table.memoryId] },
}));
