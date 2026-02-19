import { pgTable, text, boolean, integer } from "drizzle-orm/pg-core";
import { tasksTable } from "./tasks.schema.js";

export const taskItemsTable = pgTable("task_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  taskId: text("task_id").notNull().references(() => tasksTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: integer("order").notNull().default(0),
});
