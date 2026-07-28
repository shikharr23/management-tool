import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import authMiddleware, { authorizeProject, requireProjectOwner, resolveProjectAccess } from "../middleware/authMiddleware.js";
import { z } from "zod";
import CustomError from "../utils/CustomError.js";

const projectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().default(""),
  deadline: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.date().optional()
  ),
});

const memberSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  role: z.enum(["projectManager", "member"]).default("member"),
});

const memberRoleSchema = z.object({
  role: z.enum(["projectManager", "member"]),
});

const projectRoute = express.Router();

projectRoute.get("/", authMiddleware, async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
  }).sort({ updatedAt: -1 });
  res.status(200).json(projects);
});

projectRoute.get("/:id", authMiddleware, async (req, res) => {
  const access = await resolveProjectAccess(req.params.id, req.user.id);

  if (!access.project) {
    throw new CustomError("Project not found", 404);
  }
  if (!access.isMember && req.user.role !== "admin") {
    throw new CustomError("Not authorized", 403);
  }
  res.status(200).json(access.project);
});

//post
projectRoute.post("/", authMiddleware, async (req, res) => {
  const validated = projectSchema.safeParse(req.body);
  if (!validated.success) {
    throw new CustomError(validated.error.message, 400);
  }
  const project = new Project({
    ...validated.data,
    owner: req.user.id,
  });
  await project.save();
  res.status(201).json(project);
});

//patch
projectRoute.patch("/:id", authMiddleware, authorizeProject(["projectManager"]), async (req, res) => {
  const validated = projectSchema.partial().safeParse(req.body);
  if (!validated.success) {
    throw new CustomError(validated.error.message, 400);
  }
  Object.assign(req.project, validated.data);
  await req.project.save();
  res.status(200).json(req.project);
});

projectRoute.get("/:id/members", authMiddleware, authorizeProject([]), async (req, res) => {
  const members = await Promise.all(
    req.project.members.map(async (member) => {
      const user = await User.findById(member.user).select("email profile");
      return {
        user: user
          ? {
              _id: user._id,
              email: user.email,
              profile: user.profile,
            }
          : member.user,
        role: member.role,
        joinedAt: member.joinedAt,
      };
    })
  );

  res.status(200).json({
    owner: req.project.owner,
    members,
  });
});

projectRoute.post("/:id/members", authMiddleware, authorizeProject(["projectManager"]), async (req, res) => {
  const validated = memberSchema.safeParse(req.body);
  if (!validated.success) {
    throw new CustomError(validated.error.message, 400);
  }

  const user = await User.findById(validated.data.userId);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (req.project.owner.toString() === validated.data.userId) {
    throw new CustomError("Project owner is already part of the project", 400);
  }

  const existingMember = req.project.members.find(
    (member) => member.user.toString() === validated.data.userId,
  );

  if (existingMember) {
    existingMember.role = validated.data.role;
  } else {
    req.project.members.push({
      user: validated.data.userId,
      role: validated.data.role,
    });
  }

  await req.project.save();
  res.status(200).json(req.project);
});

projectRoute.patch("/:id/members/:userId", authMiddleware, requireProjectOwner, async (req, res) => {
  const validated = memberRoleSchema.safeParse(req.body);
  if (!validated.success) {
    throw new CustomError(validated.error.message, 400);
  }

  if (req.project.owner.toString() === req.params.userId) {
    throw new CustomError("Project owner role cannot be changed", 400);
  }

  const member = req.project.members.find(
    (entry) => entry.user.toString() === req.params.userId,
  );

  if (!member) {
    throw new CustomError("Member not found", 404);
  }

  member.role = validated.data.role;
  await req.project.save();
  res.status(200).json(req.project);
});

projectRoute.delete("/:id/members/:userId", authMiddleware, authorizeProject(["projectManager"]), async (req, res) => {
  if (req.project.owner.toString() === req.params.userId) {
    throw new CustomError("Project owner cannot be removed", 400);
  }

  const memberIndex = req.project.members.findIndex(
    (entry) => entry.user.toString() === req.params.userId,
  );

  if (memberIndex === -1) {
    throw new CustomError("Member not found", 404);
  }

  req.project.members.splice(memberIndex, 1);
  await req.project.save();
  res.status(200).json({ message: "Member removed successfully" });
});

// delete
projectRoute.delete("/:id", authMiddleware, requireProjectOwner, async (req, res) => {
  await Task.deleteMany({ project: req.params.id });
  await Project.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Project deleted" });
});

export default projectRoute;
