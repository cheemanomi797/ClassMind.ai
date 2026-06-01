const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Get all classes
router.get('/', async (req, res) => {
    console.log('GET /api/classes');
    try {
        const classes = await Class.find();
        res.json(classes);
    } catch (err) {
        console.error('Error in GET /:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get specific class
router.get('/:id', async (req, res) => {
    console.log(`GET /api/classes/${req.params.id}`);
    try {
        const cls = await Class.findOne({ id: req.params.id });
        if (!cls) return res.status(404).json({ message: 'Class not found' });
        res.json(cls);
    } catch (err) {
        console.error('Error in GET /:id:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create class
router.post('/', async (req, res) => {
    console.log('POST /api/classes', req.body);
    try {
        const body = { ...req.body };
        // If id is not provided (usually from frontend create), 
        // generate a numeric one if the schema requires it, 
        // or just let it be if it's a string (like 'CS401').
        // However, looking at the schema, 'id' is a String.
        // But the user mentioned Numeric IDs earlier.
        // Let's check the schema again.

        const cls = new Class(body);
        const newClass = await cls.save();
        console.log('Successfully saved class:', newClass.id);
        res.status(201).json(newClass);
    } catch (err) {
        console.error('Error in POST / api/classes:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update class
router.patch('/:id', async (req, res) => {
    console.log(`PATCH /api/classes/${req.params.id}`, req.body);
    try {
        const updatedClass = await Class.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!updatedClass) {
            console.log(`Class ${req.params.id} not found for update`);
            return res.status(404).json({ message: 'Class not found' });
        }
        console.log(`Successfully updated class ${req.params.id}`);
        res.json(updatedClass);
    } catch (err) {
        console.error('Error in PATCH / api/classes:', err);
        res.status(400).json({ message: err.message });
    }
});

const Student = require('../models/Student'); // Ensure Student model is imported

// Delete class
router.delete('/:id', async (req, res) => {
    console.log(`DELETE /api/classes/${req.params.id}`);
    try {
        const deleted = await Class.findOneAndDelete({ id: req.params.id });
        if (!deleted) return res.status(404).json({ message: 'Class not found' });

        // Cleanup: Remove this class from all students' enrolledClasses
        await Student.updateMany(
            { enrolledClasses: req.params.id },
            { $pull: { enrolledClasses: req.params.id } }
        );
        console.log(`Removed class ${req.params.id} from student enrollments`);

        res.json({ message: 'Class deleted and students unenrolled' });
    } catch (err) {
        console.error('Error in DELETE /:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
