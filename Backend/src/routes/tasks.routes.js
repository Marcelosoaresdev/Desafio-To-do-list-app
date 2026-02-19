import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  toggleItem,
} from "../controllers/tasks.controller.js";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:taskId/items/:itemId/toggle", toggleItem);

export default router;
