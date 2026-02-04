import dotenv from "dotenv";
import prisma from "./config/database";
import app from "./app";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on("error", (error: any) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use!\n`);
    console.error("This is often caused by macOS AirPlay Receiver.");
    console.error("To fix this:");
    console.error("  1. Go to System Settings → General → AirDrop & Handoff");
    console.error('  2. Turn OFF "AirPlay Receiver"');
    console.error("  3. Try running the server again\n");
    console.error(
      `Or kill the process manually: lsof -ti:${PORT} | xargs kill -9\n`,
    );
    process.exit(1);
  } else {
    console.error("Server error:", error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
  });
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
