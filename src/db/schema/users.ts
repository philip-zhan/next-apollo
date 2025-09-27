import { integer, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "./_timestamps";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ...timestamps,
});
