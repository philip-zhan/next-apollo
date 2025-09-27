import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deleted_at: timestamp(),
};
