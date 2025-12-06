import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'analytIQ API is running' });
});

export default router;

