import { Router } from 'express';
import multer from 'multer';
import { aiService } from '../services/ai.service';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload and process a document
router.post('/process-document', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const text = await aiService.extractTextFromPDF(req.file.buffer);
        const result = await aiService.generateFlashcards(text);

        if (result.success) {
            res.json({ success: true, flashcards: result.flashcards });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error processing document:', error);
        res.status(500).json({ success: false, error: 'Failed to process document' });
    }
});

// Get all flashcards for a deck
router.get('/deck/:deckId', async (req, res) => {
    try {
        // TODO: Implement database integration
        res.json({ message: 'Get flashcards endpoint' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch flashcards' });
    }
});

// Create a new flashcard deck
router.post('/deck', async (req, res) => {
    try {
        // TODO: Implement database integration
        res.json({ message: 'Create deck endpoint' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create deck' });
    }
});

// Update flashcard progress
router.put('/card/:cardId/progress', async (req, res) => {
    try {
        // TODO: Implement database integration
        res.json({ message: 'Update progress endpoint' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

export default router; 