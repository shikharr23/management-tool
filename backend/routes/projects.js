import express from "express";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  deadline: z.coerce().date(),
});

const projectRoute = express.Router();


projectRoute.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


projectRoute.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    res.status(200).json(project);
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
      user: req.user.id,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


//patch
projectRoute.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const validated = projectSchema.partial().safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.message });
    }
    Object.assign(project, validated.data);
    await project.save();
    res.status(200).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// delete
projectRoute.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default projectRoute;
