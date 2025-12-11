import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  // Quick health check response for Railway
  res.status(200).json({ 
    status: 'ok', 
    message: 'analytIQ API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;

