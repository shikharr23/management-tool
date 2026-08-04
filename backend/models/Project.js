import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["projectManager", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// --- Indexes ---
// Speeds up "find all projects owned by user X"
projectSchema.index({ owner: 1 });

// Multikey index — MongoDB indexes each element of the members array
// Speeds up "find all projects where user X is a member"
projectSchema.index({ "members.user": 1 });

const Project = mongoose.model("Project", projectSchema);
export default Project;
