import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["todo", "completed", "review", "in-progress"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// --- Indexes ---
// Compound index: task queries filter by project + status and sort by order
taskSchema.index({ project: 1, status: 1, order: 1 });

// Single-field indexes for common lookups
taskSchema.index({ assignedTo: 1 });  // "show me all tasks assigned to user X"
taskSchema.index({ dueDate: 1 });     // "sort/filter tasks by deadline"

const Task = mongoose.model("Task", taskSchema);
export default Task;
