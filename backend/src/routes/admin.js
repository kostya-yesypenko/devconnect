const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");

// Get all users
router.get("/users", auth, admin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Block user
router.put("/users/:id/block", auth, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = true;
  await user.save();
  res.json({ message: "User blocked successfully" });
});

// Unblock user
router.put("/users/:id/unblock", auth, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = false;
  await user.save();
  res.json({ message: "User unblocked successfully" });
});

module.exports = router;
