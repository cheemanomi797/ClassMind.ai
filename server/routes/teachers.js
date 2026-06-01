const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const User = require('../models/User');

// Get all teachers
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get teacher by email
router.get('/email/:email', async (req, res) => {
    console.log(`GET /api/teachers/email/${req.params.email}`);
    try {
        const teacher = await Teacher.findOne({ email: req.params.email });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (err) {
        console.error('Error in GET /email:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create teacher
router.post('/', async (req, res) => {
    console.log('POST /api/teachers', req.body);
    try {
        const body = { ...req.body };
        if (!body.id) {
            const lastTeacher = await Teacher.findOne().sort({ id: -1 });
            body.id = lastTeacher ? lastTeacher.id + 1 : 1;
        }

        const teacher = new Teacher(body);
        const newTeacher = await teacher.save();

        // Sync with User collection for login
        const user = new User({
            id: body.id,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password || 'password123',
            role: 'teacher',
            assignedClasses: body.assignedClasses || []
        });
        await user.save();

        res.status(201).json(newTeacher);
    } catch (err) {
        console.error('Error in POST /:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update teacher
router.patch('/:id', async (req, res) => {
    const id = Number(req.params.id);
    console.log(`PATCH /api/teachers/${id}`, req.body);
    try {
        const updatedTeacher = await Teacher.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });

        // Sync with User collection
        await User.findOneAndUpdate({ id: id }, req.body);

        res.json(updatedTeacher);
    } catch (err) {
        console.error('Error in PATCH /:', err);
        res.status(400).json({ message: err.message });
    }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    console.log(`DELETE /api/teachers/${id}`);
    try {
        const deleted = await Teacher.findOneAndDelete({ id: id });
        if (!deleted) return res.status(404).json({ message: 'Teacher not found' });

        // Sync with User collection
        await User.findOneAndDelete({ id: id });

        res.json({ message: 'Teacher deleted' });
    } catch (err) {
        console.error('Error in DELETE /:', err);
        res.status(500).json({ message: err.message });
    }
});

// Bulk Import Teachers
router.post('/bulk', async (req, res) => {
    const teachersData = req.body;
    if (!Array.isArray(teachersData)) {
        return res.status(400).json({ message: 'Input must be an array of teachers' });
    }

    const results = { success: 0, failed: 0, errors: [] };

    try {
        const lastTeacher = await Teacher.findOne().sort({ id: -1 });
        let currentId = lastTeacher ? lastTeacher.id + 1 : 1;

        for (const data of teachersData) {
            try {
                const teacherId = currentId++;
                const teacher = new Teacher({
                    ...data,
                    id: teacherId,
                    status: data.status || 'Active',
                    role: 'teacher',
                    assignedClasses: []
                });
                await teacher.save();

                const user = new User({
                    id: teacherId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password || 'password123',
                    role: 'teacher',
                    assignedClasses: [],
                    department: data.department
                });
                await user.save();

                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ email: data.email, error: err.message });
            }
        }
        res.json(results);
    } catch (err) {
        console.error('Bulk import error:', err);
        res.status(500).json({ message: 'Bulk import failed', error: err.message });
    }
});

module.exports = router;
