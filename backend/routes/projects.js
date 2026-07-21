import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import authMiddleware, { authorizeProject, requireProjectOwner, resolveProjectAccess } from "../middleware/authMiddleware.js";
import { z } from "zod";

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
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    }).sort({ updatedAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


projectRoute.get("/:id", authMiddleware, async (req, res) => {
  try {
    const access = await resolveProjectAccess(req.params.id, req.user.id);

    if (!access.project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (!access.isMember && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    res.status(200).json(access.project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//post
projectRoute.post("/", authMiddleware, async (req, res) => {
  try {
    const validated = projectSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }
    const project = new Project({
      ...validated.data,
      owner: req.user.id,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


//patch
projectRoute.patch("/:id", authMiddleware, authorizeProject(["projectManager"]), async (req, res) => {
  try {
    const validated = projectSchema.partial().safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }
    Object.assign(req.project, validated.data);
    await req.project.save();
    res.status(200).json(req.project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


projectRoute.get("/:id/members", authMiddleware, authorizeProject([]), async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


projectRoute.post("/:id/members", authMiddleware, authorizeProject(["projectManager"]), async (req, res) => {
  try {
    const validated = memberSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }

    const user = await User.findById(validated.data.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.project.owner.toString() === validated.data.userId) {
      return res.status(400).json({ error: "Project owner is already part of the project" });
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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


projectRoute.patch("/:id/members/:userId", authMiddleware, requireProjectOwner, async (req, res) => {
  try {
    const validated = memberRoleSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }

    if (req.project.owner.toString() === req.params.userId) {
      return res.status(400).json({ error: "Project owner role cannot be changed" });
    }

    const member = req.project.members.find(
      (entry) => entry.user.toString() === req.params.userId,
    );

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    member.role = validated.data.role;
    await req.project.save();
    res.status(200).json(req.project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


projectRoute.delete("/:id/members/:userId", authMiddleware, authorizeProject(["projectManager"]), async (req, res) => {
  try {
    if (req.project.owner.toString() === req.params.userId) {
      return res.status(400).json({ error: "Project owner cannot be removed" });
    }

    const memberIndex = req.project.members.findIndex(
      (entry) => entry.user.toString() === req.params.userId,
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: "Member not found" });
    }

    req.project.members.splice(memberIndex, 1);
    await req.project.save();
    res.status(200).json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// delete
projectRoute.delete("/:id", authMiddleware, requireProjectOwner, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default projectRoute;
