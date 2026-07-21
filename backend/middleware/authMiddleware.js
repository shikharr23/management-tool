// jwt verification

import "dotenv/config";
import jwt from "jsonwebtoken";
import Project from "../models/Project.js";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRecord = await User.findById(decoded.id).select("profile.role");
    req.user = {
      ...decoded,
      role: decoded.role ?? userRecord?.profile?.role ?? "user",
    };
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired Token" });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const userRole = req.user.role ?? "user";
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({ msg: "Insufficient permissions" });
    }

    next();
  };
};

export const requireAdmin = requireRole(["admin"]);

export const resolveProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { project: null, isOwner: false, isMember: false, role: null, member: null };
  }

  const normalizedUserId = userId?.toString();
  const isOwner = project.owner?.toString() === normalizedUserId;
  const member = project.members.find((entry) => entry.user?.toString() === normalizedUserId);

  return {
    project,
    isOwner,
    isMember: isOwner || Boolean(member),
    role: isOwner ? "owner" : member?.role ?? null,
    member,
  };
};

export const authorizeProject = (allowedRoles = []) => {
  return async (req, res, next) => {
    const projectId = req.params.projectId ?? req.params.id;

    if (!projectId) {
      return res.status(400).json({ msg: "Project id is required" });
    }

    try {
      const access = await resolveProjectAccess(projectId, req.user.id);

      if (!access.project) {
        return res.status(404).json({ msg: "Project not found" });
      }

      if (req.user.role === "admin") {
        req.project = access.project;
        req.projectAccess = access;
        return next();
      }

      if (!access.isMember) {
        return res.status(403).json({ msg: "You are not a member of this project" });
      }

      if (allowedRoles.length > 0 && access.role !== "owner" && !allowedRoles.includes(access.role)) {
        return res.status(403).json({ msg: "Insufficient permissions" });
      }

      req.project = access.project;
      req.projectAccess = access;
      next();
    } catch (error) {
      return res.status(500).json({ msg: "Failed to authorize project" });
    }
  };
};

export const requireProjectOwner = async (req, res, next) => {
  const projectId = req.params.projectId ?? req.params.id;

  if (!projectId) {
    return res.status(400).json({ msg: "Project id is required" });
  }

  try {
    const access = await resolveProjectAccess(projectId, req.user.id);

    if (!access.project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (req.user.role === "admin" || access.isOwner) {
      req.project = access.project;
      req.projectAccess = access;
      return next();
    }

    return res.status(403).json({ msg: "Only the project owner can perform this action" });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to authorize project" });
  }
};

export default authMiddleware;
