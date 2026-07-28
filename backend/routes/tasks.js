import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import authMiddleware, { resolveProjectAccess } from "../middleware/authMiddleware.js";
import { z } from "zod";
import CustomError from "../utils/CustomError.js";

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
  const userProjects = await Project.find({
    $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
  });
  const projectIds = userProjects.map((p) => p._id);
  const { projectId } = req.query;

  if (projectId) {
    const access = await resolveProjectAccess(projectId, req.user.id);
    if (req.user.role !== "admin" && (!access.project || !access.isMember)) {
      throw new CustomError("Not authorized", 403);
    }
  }

  const filter = projectId
    ? { project: projectId }
    : { project: { $in: projectIds } };

  const tasks = await Task.find(filter).populate("project");
  res.status(200).json(tasks);
});

taskRoute.get("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id).populate("project createdBy assignedTo");
  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const access = await resolveProjectAccess(task.project._id, req.user.id);
  if (req.user.role !== "admin" && (!access.project || !access.isMember)) {
    throw new CustomError("Not authorized", 403);
  }

  res.status(200).json(task);
});

taskRoute.post("/", authMiddleware, async (req, res) => {
  const validated = taskSchema.safeParse(req.body);
  if (!validated.success) {
    throw new CustomError(validated.error.message, 400);
  }

  const access = await resolveProjectAccess(validated.data.project, req.user.id);
  if (!access.project) {
    throw new CustomError("Project not found", 404);
  }
  if (req.user.role !== "admin" && (!access.isMember || (access.role !== "owner" && access.role !== "projectManager"))) {
    throw new CustomError("Not authorized", 403);
  }

  if (validated.data.assignedTo) {
    const assigneeAccess = await resolveProjectAccess(validated.data.project, validated.data.assignedTo);
    if (!assigneeAccess.project || !assigneeAccess.isMember) {
      throw new CustomError("Assigned user must be a member of the project", 400);
    }
  }

  const task = new Task({
    ...validated.data,
    createdBy: req.user.id,
  });
  await task.save();
  await task.populate("project createdBy assignedTo");
  res.status(201).json(task);
});

taskRoute.patch("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id).populate("project createdBy assignedTo");
  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const access = await resolveProjectAccess(task.project._id, req.user.id);
  if (req.user.role !== "admin" && (!access.project || !access.isMember || (access.role !== "owner" && access.role !== "projectManager"))) {
    throw new CustomError("Not authorized", 403);
  }

  const validated = taskSchema.partial().safeParse(req.body);
  if (!validated.success) {
    throw new CustomError(validated.error.message, 400);
  }

  if (validated.data.project && validated.data.project !== task.project._id.toString()) {
    throw new CustomError("Task cannot be moved to another project", 400);
  }

  if (validated.data.assignedTo) {
    const assigneeAccess = await resolveProjectAccess(task.project._id, validated.data.assignedTo);
    if (!assigneeAccess.project || !assigneeAccess.isMember) {
      throw new CustomError("Assigned user must be a member of the project", 400);
    }
  }

  const { project: ignoredProject, ...updatableFields } = validated.data;
  Object.assign(task, updatableFields);
  await task.save();
  await task.populate("project createdBy assignedTo");
  res.status(200).json(task);
});

taskRoute.delete("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id).populate("project");
  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const access = await resolveProjectAccess(task.project._id, req.user.id);
  if (req.user.role !== "admin" && (!access.project || !access.isMember || (access.role !== "owner" && access.role !== "projectManager"))) {
    throw new CustomError("Not authorized", 403);
  }

  await Task.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Task deleted" });
});

export default taskRoute;
