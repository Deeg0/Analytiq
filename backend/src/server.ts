// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import analysisRoutes from './routes/analysis';
import healthRoutes from './routes/health';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for Railway and rate limiting
app.set('trust proxy', true);

// Middleware
// CORS configuration - allow Netlify and localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  process.env.FRONTEND_URL,
  process.env.NETLIFY_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow Netlify domains
    if (origin.includes('.netlify.app') || origin.includes('netlify.com')) {
      return callback(null, true);
    }
    
    // Allow Railway domains
    if (origin.includes('.railway.app') || origin.includes('railway.app')) {
      return callback(null, true);
    }
    
    // Allow Vercel domains
    if (origin.includes('.vercel.app') || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Allow custom domain analytiq-app.com
    if (origin.includes('analytiq-app.com')) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'analytIQ Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      analyze: '/api/analyze'
    }
  });
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/analyze', analysisRoutes);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

