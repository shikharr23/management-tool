import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import authMiddleware, { resolveProjectAccess } from "../middleware/authMiddleware.js";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  project: z.string().min(1, "Project ID is required"),
  assignedTo: z.string().optional(),
  status: z.enum(["todo", "in-progress", "completed", "review"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.date().optional()
  ),
});

const taskRoute = express.Router();


taskRoute.get("/", authMiddleware, async (req, res) => {
  try {
    const userProjects = await Project.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    });
    const projectIds = userProjects.map((p) => p._id);
    const { projectId } = req.query;

    if (projectId) {
      const access = await resolveProjectAccess(projectId, req.user.id);
      if (req.user.role !== "admin" && (!access.project || !access.isMember)) {
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
    const task = await Task.findById(req.params.id).populate("project createdBy assignedTo");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const access = await resolveProjectAccess(task.project._id, req.user.id);
    if (req.user.role !== "admin" && (!access.project || !access.isMember)) {
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

    const access = await resolveProjectAccess(validated.data.project, req.user.id);
    if (!access.project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (req.user.role !== "admin" && (!access.isMember || (access.role !== "owner" && access.role !== "projectManager"))) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (validated.data.assignedTo) {
      const assigneeAccess = await resolveProjectAccess(validated.data.project, validated.data.assignedTo);
      if (!assigneeAccess.project || !assigneeAccess.isMember) {
        return res.status(400).json({ error: "Assigned user must be a member of the project" });
      }
    }

    const task = new Task({
      ...validated.data,
      createdBy: req.user.id,
    });
    await task.save();
    await task.populate("project createdBy assignedTo");
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


taskRoute.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project createdBy assignedTo");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const access = await resolveProjectAccess(task.project._id, req.user.id);
    if (req.user.role !== "admin" && (!access.project || !access.isMember || (access.role !== "owner" && access.role !== "projectManager"))) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const validated = taskSchema.partial().safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }

    if (validated.data.project && validated.data.project !== task.project._id.toString()) {
      return res.status(400).json({ error: "Task cannot be moved to another project" });
    }

    if (validated.data.assignedTo) {
      const assigneeAccess = await resolveProjectAccess(task.project._id, validated.data.assignedTo);
      if (!assigneeAccess.project || !assigneeAccess.isMember) {
        return res.status(400).json({ error: "Assigned user must be a member of the project" });
      }
    }

    const { project: ignoredProject, ...updatableFields } = validated.data;
    Object.assign(task, updatableFields);
    await task.save();
    await task.populate("project createdBy assignedTo");
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

    const access = await resolveProjectAccess(task.project._id, req.user.id);
    if (req.user.role !== "admin" && (!access.project || !access.isMember || (access.role !== "owner" && access.role !== "projectManager"))) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default taskRoute;


