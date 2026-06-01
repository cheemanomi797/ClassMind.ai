const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get student by email
router.get('/email/:email', async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.params.email });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create student
router.post('/', async (req, res) => {
    try {
        const body = { ...req.body };
        if (!body.id) {
            const lastStudent = await Student.findOne().sort({ id: -1 });
            body.id = lastStudent ? lastStudent.id + 1 : 100;
        }

        const student = new Student(body);
        const newStudent = await student.save();

        // Sync with User collection for login
        const user = new User({
            id: body.id,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password || 'password123',
            role: 'student',
            enrolledClasses: body.enrolledClasses || [],
            studentId: body.studentId,
            program: body.program,
            year: body.year
        });
        await user.save();

        res.status(201).json(newStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update student
router.patch('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const updatedStudent = await Student.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });

        // Sync with User collection
        await User.findOneAndUpdate({ id: id }, req.body);

        res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const deleted = await Student.findOneAndDelete({ id: id });
        if (!deleted) return res.status(404).json({ message: 'Student not found' });

        // Sync with User collection
        await User.findOneAndDelete({ id: id });

        res.json({ message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Bulk import students
router.post('/bulk', async (req, res) => {
    console.log('POST /api/students/bulk', req.body.length, 'students');
    const studentsData = req.body;
    const results = { success: 0, failed: 0, errors: [] };

    try {
        let lastStudent = await Student.findOne().sort({ id: -1 });
        let currentId = lastStudent ? lastStudent.id + 1 : 100;

        for (const data of studentsData) {
            try {
                // Determine ID
                const studentId = currentId++;

                const student = new Student({
                    ...data,
                    id: studentId,
                    status: data.status || 'Active',
                    progress: data.progress || '0%',
                    materialsCount: 0,
                    updatesCount: 0
                });
                await student.save();

                const user = new User({
                    id: studentId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password || 'password123',
                    role: 'student',
                    enrolledClasses: data.enrolledClasses || [],
                    studentId: data.studentId,
                    program: data.program,
                    year: data.year
                });
                await user.save();
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ email: data.email, error: err.message });
            }
        }
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: 'Bulk import failed', error: err.message });
    }
});

module.exports = router;
