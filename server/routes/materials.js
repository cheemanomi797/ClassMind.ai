const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Helper to generate AI summary
async function generateAISummary(filePath, mimetype) {
    let extractedText = '';

    try {
        if (mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else {
            // For PPT or other formats, text extraction can be complex, so we provide generic text
            extractedText = "This is a presentation file regarding class lectures.";
        }

        // Limit length of text passed to AI to avoid gigantic token usage
        extractedText = extractedText.substring(0, 15000);

        if (!process.env.GEMINI_API_KEY) {
            console.log("No GEMINI_API_KEY found. Falling back to mock summary.");
            return generateMockSummary(extractedText);
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please read the following lecture excerpt and provide a concise, structured 3-bullet point summary for students to review quickly:\n\n${extractedText}`,
        });
        
        return response.text;
    } catch (err) {
        console.error("AI Generation Error", err);
        return "Summary could not be automatically generated.";
    }
}

function generateMockSummary(text) {
    return `• Key concepts relating to ${text.substring(0, 30).replace(/[^a-zA-Z]/g, " ")} are covered.\n• Reviews foundational principles designed for student learning.\n• Includes practice elements and detailed slides.`;
}

// Routes
// POST /api/materials/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { title, description, classId, teacherId } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'No file uploaded' });

        let format = 'PDF';
        if (file.originalname.endsWith('.ppt') || file.originalname.endsWith('.pptx')) {
            format = 'PPT';
        }

        const fileUrl = `/uploads/${file.filename}`;
        
        // Generate AI Summary
        const aiSummary = await generateAISummary(file.path, file.mimetype);

        const material = new Material({
            id: 'MAT' + Date.now().toString().slice(-6),
            title,
            description,
            format,
            fileUrl,
            classId,
            teacherId,
            aiSummary,
            accessedBy: []
        });

        const savedMaterial = await material.save();
        res.status(201).json(savedMaterial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/materials/class/:classId
router.get('/class/:classId', async (req, res) => {
    try {
        const materials = await Material.find({ classId: req.params.classId });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/materials/:id
router.get('/:id', async (req, res) => {
    try {
        const material = await Material.findOne({ id: req.params.id });
        if (!material) return res.status(404).json({ message: 'Material not found' });
        res.json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/materials/:id
router.put('/:id', async (req, res) => {
    try {
        const updated = await Material.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/materials/:id
router.delete('/:id', async (req, res) => {
    try {
        const material = await Material.findOne({ id: req.params.id });
        if (material) {
            const filePath = path.join(__dirname, '../', material.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            await Material.findOneAndDelete({ id: req.params.id });
        }
        res.json({ message: 'Material deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST mark as accessed
router.post('/:id/access', async (req, res) => {
    try {
        const { studentId } = req.body;
        const material = await Material.findOne({ id: req.params.id });
        
        if (!material.accessedBy.includes(studentId)) {
            material.accessedBy.push(studentId);
            await material.save();
        }
        res.json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
