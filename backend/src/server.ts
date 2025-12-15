// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import analysisRoutes from './routes/analysis';
import healthRoutes from './routes/health';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Trust proxy - required for Railway and rate limiting
app.set('trust proxy', true);

// Middleware
// CORS configuration - allow Netlify and localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://analytiq-app.com',
  'https://www.analytiq-app.com',
  'http://analytiq-app.com',
  'http://www.analytiq-app.com',
  process.env.FRONTEND_URL,
  process.env.NETLIFY_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Log the origin for debugging
    console.log('CORS check - Origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow Netlify domains
    if (origin.includes('.netlify.app') || origin.includes('netlify.com')) {
      console.log('CORS: Allowing Netlify domain');
      return callback(null, true);
    }
    
    // Allow Railway domains
    if (origin.includes('.railway.app') || origin.includes('railway.app')) {
      console.log('CORS: Allowing Railway domain');
      return callback(null, true);
    }
    
    // Allow Vercel domains
    if (origin.includes('.vercel.app') || origin.includes('vercel.app')) {
      console.log('CORS: Allowing Vercel domain');
      return callback(null, true);
    }
    
    // Allow custom domain analytiq-app.com (with or without www, http or https)
    if (origin.includes('analytiq-app.com')) {
      console.log('CORS: Allowing analytiq-app.com domain');
      return callback(null, true);
    }
    
    // Check against allowed origins (exact match)
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing exact match from allowedOrigins');
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log('CORS: Development mode - allowing all origins');
      return callback(null, true);
    }
    
    console.log('CORS: Rejecting origin:', origin);
    console.log('CORS: Allowed origins:', allowedOrigins);
    callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root route - must be before static files and other routes
app.get('/', (req, res, next) => {
  console.log('Root route hit:', req.method, req.url, req.path);
  return res.json({
    status: 'ok',
    message: 'analytIQ Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      analyze: '/api/analyze'
    }
  });
});

// Serve static files from frontend (after root route)
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/analyze', analysisRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      analyze: 'POST /api/analyze'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  
  // Handle specific error types
  if (err.message?.includes('timeout')) {
    return res.status(504).json({
      error: 'Request timeout',
      message: err.message
    });
  }
  
  if (err.message?.includes('rate limit')) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: err.message
    });
  }
  
  // Determine status code based on error message
  let statusCode = 500;
  if (err.message?.includes('Invalid') || err.message?.includes('required') || err.message?.includes('must')) {
    statusCode = 400;
  } else if (err.message?.includes('not found') || err.message?.includes('404')) {
    statusCode = 404;
  } else if (err.message?.includes('authentication') || err.message?.includes('API key')) {
    statusCode = 401;
  } else if (err.message?.includes('CORS') || err.message?.includes('Not allowed by CORS')) {
    statusCode = 403;
  }
  
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : 'Request error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://0.0.0.0:${PORT}/api/health`);
});

// Handle uncaught errors to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, keep the server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, keep the server running
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;

