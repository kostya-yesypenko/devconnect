const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../models/Post");

// GET /api/posts - public feed
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(posts);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// POST /api/posts - create (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = new Post({ author: req.user._id, content });
    await post.save();
    await post.populate("author", "name email");
    res.json(post);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// DELETE /api/posts/:id - delete if owner
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await post.remove();
    res.json({ message: "Post removed" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// GET /api/posts/mine - get posts by current user
router.get("/mine", auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
