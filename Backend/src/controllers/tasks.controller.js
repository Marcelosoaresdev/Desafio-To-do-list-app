import { and, eq } from "drizzle-orm";
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

    if (!title) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }

    const [newTask] = await db
      .insert(tasksTable)
      .values({
        title,
        description,
        status,
        userId: authenticatedUserId,
      })
      .returning();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const [updatedTask] = await db
      .update(tasksTable)
      .set({ title, description, status })
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, req.userId)))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedTask] = await db
      .delete(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, req.userId)))
      .returning();

    if (!deletedTask) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json({ message: "Tarefa deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
