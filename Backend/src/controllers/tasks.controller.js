import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { tasksTable } from "../db/schema/tasks.schema.js";
import { taskItemsTable } from "../db/schema/task_items.schema.js";

const VALID_STATUSES = ["pending", "in_progress", "completed"];

export const getTasks = async (req, res) => {
  try {
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.userId, req.userId));

    if (tasks.length === 0) {
      return res.json([]);
    }

    const taskIds = tasks.map((t) => t.id);
    const items = await db
      .select()
      .from(taskItemsTable)
      .where(inArray(taskItemsTable.taskId, taskIds));

    const tasksWithItems = tasks.map((task) => ({
      ...task,
      items: items
        .filter((item) => item.taskId === task.id)
        .sort((a, b) => a.order - b.order),
    }));

    res.json(tasksWithItems);
  } catch (error) {
    console.error("Erro no getTasks:", error);
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, items } = req.body;

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

    let insertedItems = [];
    if (Array.isArray(items) && items.length > 0) {
      insertedItems = await db
        .insert(taskItemsTable)
        .values(
          items.map((item, index) => ({
            taskId: newTask.id,
            text: item.text,
            completed: item.completed ?? false,
            order: index,
          })),
        )
        .returning();
    }

    res.status(201).json({ ...newTask, items: insertedItems });
  } catch (error) {
    console.error("Erro no createTask:", error);
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, items } = req.body;

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

    let updatedItems = [];
    if (Array.isArray(items)) {
      await db.delete(taskItemsTable).where(eq(taskItemsTable.taskId, id));
      if (items.length > 0) {
        updatedItems = await db
          .insert(taskItemsTable)
          .values(
            items.map((item, index) => ({
              taskId: id,
              text: item.text,
              completed: item.completed ?? false,
              order: index,
            })),
          )
          .returning();
      }
    } else {
      updatedItems = await db
        .select()
        .from(taskItemsTable)
        .where(eq(taskItemsTable.taskId, id));
    }

    res.json({ ...updatedTask, items: updatedItems.sort((a, b) => a.order - b.order) });
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

export const toggleItem = async (req, res) => {
  try {
    const { taskId, itemId } = req.params;

    // verify ownership
    const [task] = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, req.userId)));

    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const [item] = await db
      .select()
      .from(taskItemsTable)
      .where(and(eq(taskItemsTable.id, itemId), eq(taskItemsTable.taskId, taskId)));

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    const [updatedItem] = await db
      .update(taskItemsTable)
      .set({ completed: !item.completed })
      .where(eq(taskItemsTable.id, itemId))
      .returning();

    res.json(updatedItem);
  } catch (error) {
    console.error("Erro no toggleItem:", error);
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
};
