import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: 6,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
      },
      avatar: {
        type: String,
        default:
          "https://res.cloudinary.com/dxjzq6v0f/image/upload/v1690912345/default-avatar.png",
      },
      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
      },
    },
    refreshTokens: [String],
  },
  {
    timestamps: true,
  },
);

// --- Indexes ---
// Unique index on email — enforces uniqueness at the DB level
// Also speeds up login lookups (find user by email)
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
