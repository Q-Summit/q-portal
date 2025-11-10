import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Example table - can be removed or modified as needed
export const example = sqliteTable("example", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
