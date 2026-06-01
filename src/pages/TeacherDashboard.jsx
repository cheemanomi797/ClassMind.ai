import React from 'react';
import { motion as MOTION } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, TrendingUp, Upload, Clock, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const { getTeacherData } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const teacherData = getTeacherData(currentUser?.email);

    if (!teacherData) return null;

    const iconMap = {
        BookOpen: <BookOpen size={28} color="#3B82F6" />,
        Users: <Users size={28} color="#A855F7" />,
        TrendingUp: <TrendingUp size={28} color="#6366F1" />,
        Upload: <Upload size={28} color="#EC4899" />
    };

    return (
        <MOTION.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="teacher-dashboard"
        >
            <header className="dashboard-header">
                <h1>Welcome back,</h1>
                <p>Here's an overview of your classes and upcoming sessions</p>
            </header>

            <div className="summary-cards-row">
                {teacherData.summaryStats?.map(stat => (
                    <div key={stat.id} className={`summary-card ${stat.id}`}>
                        <div className="icon-wrapper">
                            {iconMap[stat.icon]}
                        </div>
                        <span className="value">{stat.value}</span>
                        <span className="label">{stat.label}</span>
                    </div>
                ))}
            </div>

            <h2 className="section-title">My Classes</h2>

            <div className="courses-grid">
                {teacherData.courses?.map((course, idx) => {
                    const engagement = course.analytics?.summary?.engaged || 0;
                    const accentColor = idx % 2 === 0 ? '#3B82F6' : '#A855F7';

                    return (
                        <MOTION.div
                            key={course.id}
                            whileHover={{ y: -8 }}
                            className="course-card-premium"
                        >
                            <div className="course-accent" style={{ background: accentColor }} />
                            <div className="student-count-pill">
                                {course.studentsCount} students
                            </div>

                            <div className="course-title-section">
                                <h3>{course.name}</h3>
                                <span className="course-id-label">{course.id}</span>
                            </div>

                            <div className="next-session">
                                <Clock size={18} />
                                <span>Next: {course.schedule || 'TBD'}</span>
                            </div>

                            <div className="engagement-section">
                                <div className="engagement-header">
                                    <span style={{ color: 'var(--text-muted)' }}>Student Engagement</span>
                                    <span style={{ color: 'var(--text-main)' }}>{engagement}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${engagement}%`, background: accentColor }}
                                    />
                                </div>
                            </div>

                            <div className="course-actions">
                                <button className="view-btn-main" onClick={() => navigate(`/teacher/course/${course.id}`)}>
                                    View Class
                                </button>
                                <button className="icon-action-btn" onClick={() => navigate(`/teacher/course/${course.id}/upload`)}>
                                    <Upload size={20} />
                                </button>
                                <button className="icon-action-btn" onClick={() => navigate(`/teacher/course/${course.id}/analytics`)}>
                                    <BarChart3 size={20} />
                                </button>
                            </div>
                        </MOTION.div>
                    );
                })}
            </div>
        </MOTION.div>
    );
};

export default TeacherDashboard;
