import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { tasksTable } from "../db/schema/tasks.schema.js";

const VALID_STATUSES = ["pending", "in_progress", "completed"];

export const getTasks = async (req, res) => {
  try {
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.userId, req.userId));

    res.json(tasks);
  } catch (error) {
    console.error("Erro no getTasks:", error);
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const [newTask] = await db
      .insert(tasksTable)
      .values({
        title: title.trim(),
        description,
        status,
        userId: req.userId,
      })
      .returning();

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Erro no createTask:", error);
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: "Título não pode ser vazio" });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const [updatedTask] = await db
      .update(tasksTable)
      .set({
        title: title !== undefined ? title.trim() : undefined,
        description,
        status,
      })
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, req.userId)))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Erro no updateTask:", error);
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
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
    console.error("Erro no deleteTask:", error);
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
};
