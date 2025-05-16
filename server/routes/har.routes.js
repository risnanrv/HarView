// har.routes.js
import express from 'express';
import { generateHar } from '../harGenerator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(path.dirname(__dirname), 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(err => {
  console.error('Error creating uploads directory:', err);
});

router.post('/generate', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const harData = await generateHar(url);
    res.json(harData);
  } catch (err) {
    console.error('HAR generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate HAR file' });
  }
});

router.post('/post', async (req, res) => {
  try {
    // Use the upload middleware from app.locals
    req.app.locals.upload.single('harFile')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No HAR file uploaded' });
      }

      try {
        // Read the uploaded file
        const fileContent = await fs.readFile(req.file.path, 'utf8');
        
        // Parse the HAR file to validate it
        let harData;
        try {
          harData = JSON.parse(fileContent);
        } catch (parseErr) {
          await fs.unlink(req.file.path).catch(console.error);
          return res.status(400).json({ error: 'Invalid HAR file format' });
        }

        // Here you can add logic to process or store the HAR data
        // For now, we'll just acknowledge receipt
        res.json({ 
          message: 'HAR file uploaded and processed successfully',
          filename: req.file.filename,
          size: req.file.size
        });
      } catch (fileErr) {
        console.error('File processing error:', fileErr);
        res.status(500).json({ error: fileErr.message || 'Failed to process HAR file' });
      }
    });
  } catch (err) {
    console.error('HAR post error:', err);
    res.status(500).json({ error: err.message || 'Failed to process HAR data' });
  }
});

// Add a route to list all uploaded HAR files
router.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(uploadsDir);
    const harFiles = files.filter(file => file.endsWith('.har'));
    res.json({ files: harFiles });
  } catch (err) {
    console.error('Error listing HAR files:', err);
    res.status(500).json({ error: err.message || 'Failed to list HAR files' });
  }
});

export default router; // ✅ make sure this is a default export
