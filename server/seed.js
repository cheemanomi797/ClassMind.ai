const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const User = require('./models/User');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('Mongoose background connection initiated...'))
    .catch(err => console.error('Immediate connection error:', err));

const seedData = async () => {
    console.log('Starting seed process...');
    try {
        await Student.deleteMany({});
        console.log('Cleared Students');
        await Teacher.deleteMany({});
        console.log('Cleared Teachers');
        await Class.deleteMany({});
        console.log('Cleared Classes');
        await User.deleteMany({});
        console.log('Cleared Users');

        const users = [
            { id: 1, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@classmind.ai', password: 'password123', role: 'teacher', assignedClasses: ['CS401'] },
            { id: 2, firstName: 'Michael', lastName: 'Chen', email: 'michael.c@classmind.ai', password: 'password123', role: 'teacher', assignedClasses: ['CS502'] },
            { id: 101, firstName: 'Jane', lastName: 'Doe', email: 'janedoe@student.edu', password: 'password123', role: 'student', enrolledClasses: ['CS401'] },
            { id: 102, firstName: 'Alex', lastName: 'Smith', email: 'student@classmind.ai', password: 'password123', role: 'student', enrolledClasses: ['CS401', 'CS502'] },
            { id: 999, firstName: 'Admin', lastName: 'User', email: 'admin@classmind.ai', password: 'password123', role: 'admin' },
        ];

        await User.insertMany(users);
        console.log('Seeded Users');

        const teachers = [
            { id: 1, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@classmind.ai', phone: '+1 234-567-8901', department: 'Computer Science', specialization: 'AI & ML', assignedClasses: ['CS401'], status: 'Active', performance: '98%', office: 'Campus Building 4, Office 401', materialsCount: 15, role: 'teacher' },
            { id: 2, firstName: 'Michael', lastName: 'Chen', email: 'michael.c@classmind.ai', phone: '+1 234-567-8902', department: 'Computer Science', specialization: 'Deep Learning', assignedClasses: ['CS502'], status: 'Active', performance: '92%', office: 'Campus Building 4, Office 402', materialsCount: 22, role: 'teacher' },
            { id: 3, firstName: 'Emily', lastName: 'Brown', email: 'emily.b@classmind.ai', phone: '+1 234-567-8903', department: 'Mathematics', specialization: 'Statistics', assignedClasses: [], status: 'On Leave', performance: '88%', office: 'Math Building, Office 101', materialsCount: 8, role: 'teacher' },
            { id: 4, firstName: 'David', lastName: 'Wilson', email: 'david.w@classmind.ai', phone: '+1 234-567-8904', department: 'Physics', specialization: 'Quantum Mechanics', assignedClasses: [], status: 'Active', performance: '95%', office: 'Physics Lab, Office B1', materialsCount: 12, role: 'teacher' },
            { id: 5, firstName: 'Jessica', lastName: 'Davis', email: 'jessica.d@classmind.ai', phone: '+1 234-567-8905', department: 'Mathematics', specialization: 'Calculus', assignedClasses: [], status: 'Active', performance: '91%', office: 'Math Building, Office 102', materialsCount: 5, role: 'teacher' },
        ];

        const students = [
            { id: 101, firstName: 'Jane', lastName: 'Doe', email: 'janedoe@student.edu', studentId: 'STU2024001', program: 'Computer Science', year: 'Year 2', enrollmentDate: '2024-09-01', status: 'Active', role: 'student', enrolledClasses: ['CS401'], progress: '85%', materialsCount: 12, updatesCount: 3 },
            { id: 102, firstName: 'Alex', lastName: 'Smith', email: 'student@classmind.ai', studentId: 'STU2024002', program: 'AI Intelligence', year: 'Year 3', enrollmentDate: '2024-09-01', status: 'Active', role: 'student', enrolledClasses: ['CS401', 'CS502'], progress: '92%', materialsCount: 18, updatesCount: 5 },
            { id: 103, firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@student.edu', studentId: 'STU2024003', program: 'Mathematics', year: 'Year 3', enrollmentDate: '2023-09-01', status: 'Suspended', role: 'student', progress: '45%', materialsCount: 4, updatesCount: 0 },
            { id: 104, firstName: 'Bob', lastName: 'Brown', email: 'bob.b@student.edu', studentId: 'STU2024004', program: 'Physics', year: 'Year 2', enrollmentDate: '2024-01-15', status: 'Active', role: 'student', progress: '78%', materialsCount: 10, updatesCount: 2 },
        ];

        const classes = [
            {
                id: 'CS401',
                name: 'Introduction to Machine Learning',
                instructorId: 1,
                instructorName: 'Sarah Johnson',
                description: 'A comprehensive introduction to machine learning algorithms, techniques, and applications.',
                schedule: 'Monday, Wednesday 10:00 AM - 11:30 AM',
                status: 'Active',
                stats: [
                    { label: 'Total Students', value: '45' },
                    { label: 'Avg Attendance', value: '94%' },
                    { label: 'Engagement', value: '87%' },
                    { label: 'Pending Reviews', value: '5' }
                ],
                studentsCount: 45,
                participation: 89,
                tracking: [
                    { id: 101, name: 'Jane Doe', email: 'janedoe@student.edu', attendance: 95, participation: 98, engagement: 97, assignments: '10/10', trend: 'Improving' },
                    { id: 102, name: 'Alex Smith', email: 'student@classmind.ai', attendance: 87, participation: 82, engagement: 85, assignments: '9/10', trend: 'Stable' },
                    { id: 104, name: 'Bob Brown', email: 'bob.b@student.edu', attendance: 92, participation: 90, engagement: 94, assignments: '10/10', trend: 'Stable' },
                ],
                analytics: {
                    summary: { engaged: 87, neutral: 10, disengaged: 3, improvement: 12 },
                    trends: [
                        { week: 'Week 1', engaged: 75, neutral: 22, disengaged: 3 },
                        { week: 'Week 2', engaged: 78, neutral: 20, disengaged: 2 },
                        { week: 'Week 3', engaged: 82, neutral: 16, disengaged: 2 },
                        { week: 'Week 4', engaged: 85, neutral: 12, disengaged: 2 },
                        { week: 'Week 5', engaged: 87, neutral: 10, disengaged: 2 },
                        { week: 'Week 6', engaged: 90, neutral: 8, disengaged: 2 },
                    ]
                },
                recentActivity: [
                    { title: 'Uploaded "Week 5 - Neural Networks.pdf"', time: '2 hours ago', type: 'upload' },
                    { title: 'Quiz "ML Basics" published', time: 'Yesterday', type: 'assignment' },
                ]
            },
            {
                id: 'CS502',
                name: 'Advanced Deep Learning',
                instructorId: 2,
                instructorName: 'Michael Chen',
                description: 'Deep neural networks and their applications in modern AI systems.',
                schedule: 'Tuesday, Thursday 2:00 PM - 3:30 PM',
                status: 'Active',
                stats: [
                    { label: 'Total Students', value: '32' },
                    { label: 'Avg Attendance', value: '88%' },
                    { label: 'Engagement', value: '82%' },
                    { label: 'Pending Reviews', value: '8' }
                ],
                studentsCount: 32,
                participation: 76,
                tracking: [
                    { id: 102, name: 'Alex Smith', email: 'student@classmind.ai', attendance: 90, participation: 92, engagement: 93, assignments: '10/10', trend: 'Improving' },
                ],
                analytics: {
                    summary: { engaged: 82, neutral: 12, disengaged: 6, improvement: 8 },
                    trends: [
                        { week: 'Week 1', engaged: 70, neutral: 24, disengaged: 6 },
                        { week: 'Week 2', engaged: 75, neutral: 20, disengaged: 5 },
                        { week: 'Week 3', engaged: 82, neutral: 12, disengaged: 6 },
                    ]
                },
                recentActivity: [
                    { title: 'Uploaded "Advanced GANs Architecture.pdf"', time: '5 hours ago', type: 'upload' },
                ]
            }
        ];

        await Teacher.insertMany(teachers);
        console.log('Seeded Teachers');
        await Student.insertMany(students);
        console.log('Seeded Students');
        await Class.insertMany(classes);
        console.log('Seeded Classes');

        console.log('Database Seeded Successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err.message);
        process.exit(1);
    }
};

mongoose.connection.on('open', () => {
    console.log('MongoDB connection is open. Starting seedData...');
    seedData();
});
