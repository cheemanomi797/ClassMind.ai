const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Serve uploads directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('MongoDB Connected successfully to:', mongoose.connection.name))
    .catch(err => console.error('Initial MongoDB Connection Error:', err));

mongoose.connection.on('error', err => {
    console.error('Mongoose Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose Disconnected');
});

// Routes
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const userRoutes = require('./routes/users');
const materialRoutes = require('./routes/materials');

app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
