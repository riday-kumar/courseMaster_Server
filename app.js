const express = require("express");
const cors = require("cors");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
// importing auth routes
const authRoutes = require("./src/routes/auth.routes");
// importing course routes
const courseRoutes = require("./src/routes/course.routes");
// importing admin routes
const adminRoutes = require("./src/routes/admin.routes");
// importing enrollment routes
const enrollmentRoutes = require("./src/routes/enrollment.routes");
// importing assignment routes
const assignmentRoutes = require("./src/routes/assignment.routes");
// importing quiz routes
const quizRoutes = require("./src/routes/quiz.routes");
// importing error handling middleware
const errorHandler = require("./src/middlewares/errorMiddleware");
// importing user model to ensure it's registered
const userRoutes = require("./src/routes/user.routes");

const connectDB = require("./src/config/db");
const { seedDatabase } = require("./seed");

// Connect to database (non-blocking for serverless)
connectDB().catch((err) => {
  console.error("Initial DB connection failed:", err.message);
  // Don't throw - let individual requests handle connection
});

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Include PUT and DELETE
  allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"], // Include any custom headers
  credentials: true,
};

app.use(cors(corsOptions));
// Code-10 bug: custom header restricts allowed methods to GET and POST, breaking PUT/DELETE CORS preflights
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});
app.use(express.json());

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    // await seedDatabase();
    next();
  } catch (err) {
    console.error("Database connection middleware error:", err.message);
    res
      .status(500)
      .json({ message: "Database connection failed", error: err.message });
  }
});

// health check
app.get("/", (req, res) => {
  res.send("Course Master Backend Running ✅");
});

// mounting auth routes
app.use("/api/auth", authRoutes);
// mounting course routes
app.use("/api/courses", courseRoutes);
// mounting admin routes
app.use("/api/admin", adminRoutes);
// mounting enrollment routes
app.use("/api/enrollments", enrollmentRoutes);
// mounting assignment routes
app.use("/api/assignments", assignmentRoutes);
// mounting quiz routes
app.use("/api/quizzes", quizRoutes);
// mounting user routes
app.use("/api/users", userRoutes);

// 404 handler (unknown routes)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// global error handling middleware
app.use(errorHandler);

module.exports = app;
