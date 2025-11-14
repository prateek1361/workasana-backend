const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const { initializeDatabase } = require("./db/db.connect");
const {verifyToken} = require("./middleware/authMiddleware")

const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());


const User = require("./models/userSchema");
const Project = require("./models/projectSchema");
const Task = require("./models/taskSchema");
const Team = require("./models/teamSchema");
const Tag = require("./models/tagSchema");


app.get("/", (req, res) => res.send("🚀 Workasana API Running"));


app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful! Please login." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});




app.get("/users", verifyToken, async (req, res) =>
  res.json(await User.find().select("-password"))
);


app.get("/projects", verifyToken, async (req, res) =>
  res.json(await Project.find())
);
app.post("/projects", verifyToken, async (req, res) => {
  try {
    const p = new Project(req.body);
    await p.save();
    res.json(p);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


app.get("/teams", verifyToken, async (req, res) =>
  res.json(await Team.find())
);
app.post("/teams", verifyToken, async (req, res) => {
  try {
    const t = new Team(req.body);
    await t.save();
    res.json(t);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


app.get("/tags", verifyToken, async (req, res) =>
  res.json(await Tag.find())
);
app.post("/tags", verifyToken, async (req, res) => {
  try {
    const tg = new Tag(req.body);
    await tg.save();
    res.json(tg);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


app.get("/tasks", verifyToken, async (req, res) =>
  res.json(await Task.find().populate("owners", "name email"))
);
app.post("/tasks", verifyToken, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

     task = await task.populate("owners", "name email")
    res.json(task);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
