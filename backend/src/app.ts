import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import leadRoutes from "./routes/lead.routes";
import noteRoutes from "./routes/note.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import workRoutes from "./routes/work.routes";
import collegeRoutes from "./routes/college.routes";
import collegeNoteRoutes from "./routes/collegeNote.routes";
import collegeWorkRoutes from "./routes/collegeWork.routes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Real Estate API is running" });
});

// Root route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/works", workRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/college-notes", collegeNoteRoutes);
app.use("/api/college-works", collegeWorkRoutes);

// 404 handler (must be before error handler)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware (must be after all routes and 404 handler)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error caught by middleware:", err);
    console.error("Error stack:", err.stack);

    // Ensure JSON response
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        error: err.toString(),
      }),
    });
  },
);

export default app;
