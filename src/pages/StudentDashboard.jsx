import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BookOpen, TrendingUp, Folder, Bell, Video, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { getStudentData } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const studentData = getStudentData(currentUser?.email);

    if (!studentData) return <div>Loading...</div>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const statIcons = [BookOpen, TrendingUp, Folder, Bell];
    const statColors = ['#3B82F6', '#A855F7', '#6366F1', '#EC4899'];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="student-dashboard"
        >
            <div className="dashboard-header">
                <h1>Welcome back, {currentUser?.name?.split(' ')[0] || 'Student'}</h1>
                <p>Here's your learning overview for today</p>
            </div>

            <div className="stats-grid">
                {studentData.stats.map((stat, index) => {
                    const Icon = statIcons[index];
                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="stat-card"
                            style={{ borderLeft: `3px solid ${statColors[index]}` }}
                        >
                            <div className="stat-icon-wrapper" style={{ color: statColors[index] }}>
                                <Icon size={24} />
                            </div>
                            <div className="stat-info">
                                <h2 className="stat-value">{stat.value}</h2>
                                <p className="stat-label">{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="section-title">
                <h2>My Classes</h2>
            </div>

            <div className="classes-grid">
                {studentData.classes.map((cls) => (
                    <motion.div
                        key={cls.id}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="student-class-card"
                    >
                        <div className="card-accent" />
                        <div className="card-content">
                            <h3 className="class-name">{cls.name}</h3>
                            <p className="instructor-info">{cls.id} • {cls.instructor}</p>

                            <div className="meeting-info">
                                <Video size={16} />
                                <span>Next: {cls.nextSession}</span>
                            </div>

                            <div className="progress-section">
                                <div className="progress-labels">
                                    <span>Course Progress</span>
                                    <span>{cls.progress}%</span>
                                </div>
                                <div className="progress-bar-container">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cls.progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="progress-bar-fill"
                                    />
                                </div>
                            </div>

                            <div className="card-actions">
                                <button className="btn-view-class" onClick={() => navigate(`/class/${cls.id}`)}>
                                    View Class
                                </button>
                                <button className="btn-icon-session">
                                    <Video size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
