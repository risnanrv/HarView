// har.routes.js
import express from 'express';
import { generateHar } from '../harGenerator.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { url } = req.body;

  try {
    const harData = await generateHar(url);
    res.json(harData);
  } catch (err) {
    console.error('HAR generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate HAR file' });
  }
});

router.post('/post', async (req, res) => {
  const { har } = req.body;

  try {
    // Here you can add logic to process or store the HAR data
    // For now, we'll just acknowledge receipt
    res.json({ message: 'HAR data received successfully' });
  } catch (err) {
    console.error('HAR post error:', err);
    res.status(500).json({ error: err.message || 'Failed to process HAR data' });
  }
});

export default router; // ✅ make sure this is a default export
