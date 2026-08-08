import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Comment from "../models/Comment.js";
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

// GET /api/task?page=1&limit=10&status=todo&priority=high&search=auth&sortBy=dueDate&order=asc
taskRoute.get("/", authMiddleware, async (req, res) => {
  // ---- 1. Parse query parameters with sensible defaults ----
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    search,
    projectId,
    sortBy = "createdAt",  // default sort field
    order = "desc",         // default newest first
  } = req.query;

  // Sanitise page/limit to prevent nonsense values
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10)); // cap at 100

  // ---- 2. Build the base filter ----
  // Start by scoping to only projects this user can access
  const userProjects = await Project.find({
    $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
  });
  const projectIds = userProjects.map((p) => p._id);

  // If a specific projectId was requested, verify access
  if (projectId) {
    const access = await resolveProjectAccess(projectId, req.user.id);
    if (req.user.role !== "admin" && (!access.project || !access.isMember)) {
      throw new CustomError("Not authorized", 403);
    }
  }

  const filter = projectId
    ? { project: projectId }
    : { project: { $in: projectIds } };

  // ---- 3. Apply optional filters ----
  if (status)   filter.status = status;
  if (priority) filter.priority = priority;

  // Case-insensitive partial match on title (uses $regex)
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  // ---- 4. Build sort object ----
  const allowedSortFields = ["createdAt", "updatedAt", "dueDate", "priority", "status", "title"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  // ---- 5. Execute query + count in PARALLEL ----
  // This is a key optimisation: instead of running them sequentially
  // (which takes queryTime + countTime), we run both at once
  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("project")
      .populate("assignedTo", "email profile.username profile.avatar"),
    Task.countDocuments(filter),
  ]);

  // ---- 6. Return data with pagination metadata ----
  res.status(200).json({
    tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
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

// --- Comments ---

taskRoute.get("/:id/comments", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const access = await resolveProjectAccess(task.project, req.user.id);
  if (req.user.role !== "admin" && (!access.project || !access.isMember)) {
    throw new CustomError("Not authorized", 403);
  }

  const comments = await Comment.find({ task: task._id })
    .populate("user", "name email")
    .sort({ createdAt: 1 });

  res.status(200).json(comments);
});

const commentSchema = z.object({
  text: z.string().min(1, "Comment text is required"),
});

taskRoute.post("/:id/comments", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new CustomError("Task not found", 404);
  }

  const access = await resolveProjectAccess(task.project, req.user.id);
  if (req.user.role !== "admin" && (!access.project || !access.isMember)) {
    throw new CustomError("Not authorized", 403);
  }

  const validated = commentSchema.safeParse(req.body);
  if (!validated.success) {
    throw new CustomError(validated.error.message, 400);
  }

  const comment = new Comment({
    task: task._id,
    user: req.user.id,
    text: validated.data.text,
  });

  await comment.save();
  await comment.populate("user", "name email");

  res.status(201).json(comment);
});

export default taskRoute;
