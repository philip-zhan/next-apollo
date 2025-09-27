import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schema/users";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    users,
  },
});
