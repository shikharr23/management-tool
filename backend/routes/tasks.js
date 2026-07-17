import { configDotenv } from "dotenv";
import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  project: z.string().min(1, "Project ID is required"),
  status: z.enum(["todo", "in-progress", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.date().optional()
  ),
});

const taskRoute = express.Router();


taskRoute.get("/", authMiddleware, async (req, res) => {
  try {
    const userProjects = await Project.find({ user: req.user.id });
    const projectIds = userProjects.map((p) => p._id);
    const { projectId } = req.query;

    if (projectId) {
      const ownsProject = projectIds.some(
        (id) => id.toString() === projectId
      );
      if (!ownsProject) {
        return res.status(403).json({ error: "Not authorized" });
      }
    }

    const filter = projectId
      ? { project: projectId }
      : { project: { $in: projectIds } };

    const tasks = await Task.find(filter).populate("project");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


taskRoute.get("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // checking if owner owns the project
    const project = await Project.findById(task.project._id);
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


taskRoute.post("/", authMiddleware, async (req, res) => {
  try {
    const validated = taskSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }

   
    const project = await Project.findById(validated.data.project);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const task = new Task(validated.data);
    await task.save();
    await task.populate("project");
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


taskRoute.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    
    if (task.project.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const validated = taskSchema.partial().safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }

    Object.assign(task, validated.data);
    await task.save();
    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


taskRoute.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

   
    if (task.project.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default taskRoute;


