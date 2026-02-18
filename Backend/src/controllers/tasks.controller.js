import { eq } from "drizzle-orm";
import { db } from "../db/index.js";

import { tasksTable } from "../db/schema/tasks.schema.js";

export const getTasks = async (req, res) => {
  try {
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.userId, req.userId));

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const authenticatedUserId = req.userId;

    if (!title || !authenticatedUserId) {
      return res.status(400).json({ error: "Title and userId are required" });
    }

    const newTask = await db
      .insert(tasksTable)
      .values({
        title,
        description,
        status: status,
        userId: authenticatedUserId,
      })
      .returning();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {};

export const deleteTask = async (req, res) => {};
