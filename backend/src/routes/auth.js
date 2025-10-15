const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

// routes/auth.js
const multer = require("multer");

// File upload setup for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${req.user._id}-${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Update user settings
router.put("/settings", auth, upload.single("profilePhoto"), async (req, res) => {
  try {
    const { name, email, password, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // will be hashed in pre-save hook
    if (theme) user.theme = theme;

    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`; // accessible path
    }

    await user.save();
    res.json({
      message: "Settings updated successfully",
      user: {
        name: user.name,
        email: user.email,
        theme: user.theme,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: extractedErrors,
      });
    }

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({ name, email, password }); // role = 'user' by default
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      // 🧱 Check if blocked
      if (user.isBlocked)
        return res
          .status(403)
          .json({ message: "Your account has been blocked by admin." });

      const isMatch = await user.matchPassword(password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
