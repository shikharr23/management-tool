import express from "express";

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import CustomError from "../utils/CustomError.js";

const authRouter = express.Router();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.profile?.role ?? "user" },
    process.env.JWT_SECRET || "development-secret",
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || "refresh-development-secret",
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

authRouter.post("/register", async (req, res) => {
  const parsedData = registerSchema.safeParse(req.body);
  if (!parsedData.success) {
    throw new CustomError(parsedData.error.message, 400);
  }
  const { name, email, password } = parsedData.data;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError("Email already in use", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    profile: {
      username: name,
      role: "user",
    },
  });
  const { accessToken, refreshToken } = generateTokens(newUser);
  newUser.refreshTokens.push(refreshToken);
  await newUser.save();

  setRefreshTokenCookie(res, refreshToken);
  res.status(201).json({ accessToken, message: "User added successfully!" });
});

authRouter.post("/login", async (req, res) => {
  const parsedResult = loginSchema.safeParse(req.body);
  if (!parsedResult.success) {
    throw new CustomError(parsedResult.error.message, 400);
  }
  const { email, password } = parsedResult.data;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new CustomError("User does not exist", 400);
  }
  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    throw new CustomError("Password is incorrect", 400);
  }
  const { accessToken, refreshToken } = generateTokens(existingUser);
  existingUser.refreshTokens.push(refreshToken);
  await existingUser.save();

  setRefreshTokenCookie(res, refreshToken);
  res.status(200).json({ accessToken });
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json(user);
});

authRouter.get("/search", authMiddleware, async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(200).json([]);
  }
  const users = await User.find({ 
    email: { $regex: email, $options: "i" } 
  }).select("email profile.username profile.avatar _id").limit(5);
  res.status(200).json(users);
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new CustomError("Refresh token not found", 401);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "refresh-development-secret"
    );

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new CustomError("Invalid refresh token", 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.clearCookie("refreshToken");
    throw new CustomError("Session expired. Please log in again.", 401);
  }
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "refresh-development-secret"
      );
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: refreshToken }
      });
    } catch (e) {
      // Ignore invalid token during logout
    }
  }

  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successful" });
});

export default authRouter;