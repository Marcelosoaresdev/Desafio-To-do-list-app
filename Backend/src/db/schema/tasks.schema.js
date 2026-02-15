import { integer, pgEnum, pgTable, varchar, text } from "drizzle-orm/pg-core";
import { usersTable } from "./users.schema";

export const taskStatus = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
]);

export const tasksTable = pgTable("tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text("description"),
  status: taskStatus("status").notNull().default("pending"),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});
