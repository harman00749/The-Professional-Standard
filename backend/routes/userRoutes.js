const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected. Add MONGODB_URI to .env and restart the server.",
    });
  }

  return next();
};

router.use(requireDatabase);

router.get("/", async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.json({
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const user = await User.create({ name, email });

    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.message = "User with this email already exists";
    }

    if (error.name === "ValidationError") {
      error.status = 400;
    }

    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const postDeleteResult = await Post.deleteMany({ authorId: deletedUser._id });

    return res.json({
      message: "User deleted successfully",
      deletedId: deletedUser._id,
      deletedPostsCount: postDeleteResult.deletedCount,
      data: deletedUser,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
