import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';
import noteRoutes from './routes/note.routes';
import dashboardRoutes from './routes/dashboard.routes';
import workRoutes from './routes/work.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Real Estate API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/works', workRoutes);

// 404 handler (must be before error handler)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be after all routes and 404 handler)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error caught by middleware:', err);
  console.error('Error stack:', err.stack);
  
  // Ensure JSON response
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.toString()
    })
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use!\n`);
    console.error('This is often caused by macOS AirPlay Receiver.');
    console.error('To fix this:');
    console.error('  1. Go to System Settings → General → AirDrop & Handoff');
    console.error('  2. Turn OFF "AirPlay Receiver"');
    console.error('  3. Try running the server again\n');
    console.error(`Or kill the process manually: lsof -ti:${PORT} | xargs kill -9\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
