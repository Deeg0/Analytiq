import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { analyzeStudy } from '../services/analysisService';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Rate limiting
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many analysis requests, please try again later.',
});

router.post('/', analyzeLimiter, async (req, res, next) => {
  try {
    const { inputType, content, fileName } = req.body;

    if (!inputType || !content) {
      return res.status(400).json({
        error: 'Missing required fields: inputType and content are required'
      });
    }

    if (!['url', 'pdf', 'doi', 'text'].includes(inputType)) {
      return res.status(400).json({
        error: 'Invalid inputType. Must be one of: url, pdf, doi, text'
      });
    }

    // Handle PDF upload separately if needed
    if (inputType === 'pdf' && req.file) {
      // This will be handled differently, but for now we use the content from body
    }

    const result = await analyzeStudy({
      inputType,
      content,
      fileName,
    });

    res.json(result);
  } catch (error: any) {
    next(error);
  }
});

// Separate route for PDF file upload
router.post('/pdf', analyzeLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Convert buffer to base64 for consistent handling
    const content = req.file.buffer.toString('base64');
    
    const result = await analyzeStudy({
      inputType: 'pdf',
      content,
      fileName: req.file.originalname,
    });

    res.json(result);
  } catch (error: any) {
    if (error.message && error.message.includes('PDF')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

export default router;

