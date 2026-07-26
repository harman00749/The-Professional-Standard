const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const hasCloudinaryConfig = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected. Add MONGODB_URI to .env and restart the server.",
    });
  }

  return next();
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    if (!hasCloudinaryConfig()) {
      return reject(
        Object.assign(new Error("Cloudinary environment variables are required for image uploads."), {
          status: 503,
        }),
      );
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "data-storm-posts",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });

const parseAuthor = (body) => {
  if (body.authorName && body.authorEmail) {
    return {
      name: body.authorName,
      email: body.authorEmail,
    };
  }

  if (typeof body.author === "string") {
    try {
      return JSON.parse(body.author);
    } catch {
      return null;
    }
  }

  return body.author;
};

router.use(requireDatabase);

router.get("/top/recent", async (_req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("authorId", "name email")
      .sort({ createdAt: -1 })
      .limit(3);

    return res.json({
      message: "Top 3 most recent posts fetched successfully",
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Posts fetched successfully",
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post id",
      });
    }

    const post = await Post.findById(req.params.id).populate("authorId", "name email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.json({
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", upload.single("thumbnail"), async (req, res, next) => {
  try {
    const { title, content, authorId } = req.body || {};
    const author = parseAuthor(req.body || {});
    let resolvedAuthorId = authorId;
    let imageUrl = "";

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    if (!resolvedAuthorId && author?.name && author?.email) {
      const user = await User.findOneAndUpdate(
        { email: author.email.toLowerCase() },
        { name: author.name, email: author.email },
        { new: true, upsert: true, runValidators: true },
      );

      resolvedAuthorId = user._id;
    }

    if (!resolvedAuthorId || !isValidObjectId(resolvedAuthorId)) {
      return res.status(400).json({
        message: "Valid authorId is required. You can also send author: { name, email }.",
      });
    }

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const post = await Post.create({
      title,
      content,
      authorId: resolvedAuthorId,
      imageUrl,
    });

    const populatedPost = await post.populate("authorId", "name email");

    return res.status(201).json({
      message: "Post created successfully",
      data: populatedPost,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.status = 400;
    }

    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post id",
      });
    }

    const allowedUpdates = {};
    ["title", "content", "authorId"].forEach((field) => {
      if (req.body[field]) {
        allowedUpdates[field] = req.body[field];
      }
    });

    const post = await Post.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    }).populate("authorId", "name email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.json({
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.status = 400;
    }

    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post id",
      });
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.json({
      message: "Post deleted successfully",
      deletedId: deletedPost._id,
      data: deletedPost,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
