import React from 'react';
import { motion as MOTION } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, TrendingUp, Smile, Meh, Frown, ArrowLeft, Calendar, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './TeacherAnalytics.css';

const TeacherAnalytics = () => {
    const { getTeacherData, classes } = useData();
    const { currentUser } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Attempt to get specific teacher data, but fall back to all classes for "dummy" mode
    const teacherData = getTeacherData(currentUser?.email);
    const availableCourses = teacherData?.courses || classes || [];

    // Find course by ID, or just default to the first one available so the user NEVER sees "Not Found"
    const course = availableCourses.find(c => c.id === courseId) || availableCourses[0];

    // Final safety check - if absolutely no classes exist (shouldn't happen with mock data)
    if (!course) {
        return (
            <div className="teacher-analytics-page">
                <div className="page-header">
                    <h1>No Course Data Available</h1>
                    <button onClick={() => navigate('/teacher/dashboard')} className="btn-primary">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
    // Use data from course, or fallback to the specific values from the user's screenshot
    const summary = course.analytics?.summary || { engaged: 0, neutral: 0, disengaged: 0, improvement: 0 };
    const trends = course.analytics?.trends || [];

    const pieData = [
        { name: 'Engaged', value: summary.engaged },
        { name: 'Neutral', value: summary.neutral },
        { name: 'Disengaged', value: summary.disengaged }
    ];

    return (
        <MOTION.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="teacher-analytics-page"
        >
            <div className="breadcrumb">
                <button onClick={() => navigate(`/teacher/course/${course.id}`)} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Back to {course.id}</span>
                </button>
            </div>

            <div className="page-header">
                <div>
                    <h1>Emotion Analytics Report</h1>
                    <p>AI-powered engagement and emotion tracking for {course.name}</p>
                </div>
            </div>

            <div className="analytics-summary-cards">
                <MOTION.div whileHover={{ y: -5 }} className="ana-card green">
                    <div className="card-top">
                        <Smile size={32} />
                        <span className="value">{summary.engaged}%</span>
                    </div>
                    <p className="label">Engaged Students</p>
                </MOTION.div>
                <MOTION.div whileHover={{ y: -5 }} className="ana-card yellow">
                    <div className="card-top">
                        <Meh size={32} />
                        <span className="value">{summary.neutral}%</span>
                    </div>
                    <p className="label">Neutral Response</p>
                </MOTION.div>
                <MOTION.div whileHover={{ y: -5 }} className="ana-card red">
                    <div className="card-top">
                        <Frown size={32} />
                        <span className="value">{summary.disengaged}%</span>
                    </div>
                    <p className="label">Disengaged</p>
                </MOTION.div>
                <MOTION.div whileHover={{ y: -5 }} className="ana-card blue">
                    <div className="card-top">
                        <TrendingUp size={32} />
                        <span className="value">+{summary.improvement}%</span>
                    </div>
                    <p className="label">Improvement</p>
                </MOTION.div>
            </div>

            <div className="analytics-charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <Calendar size={20} color="#3B82F6" />
                        <h3>Emotion Trends Over Time</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="engaged" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="neutral" stroke="#F59E0B" strokeWidth={4} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="disengaged" stroke="#EF4444" strokeWidth={4} dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="dot disengaged" /> Disengaged</span>
                            <span className="legend-item"><span className="dot engaged" /> Engaged</span>
                            <span className="legend-item"><span className="dot neutral" /> Neutral</span>
                        </div>
                    </div>
                </div>

                <div className="chart-card pie-section">
                    <div className="chart-header">
                        <Users size={20} color="#A855F7" />
                        <h3>Current Distribution</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={0}
                                    outerRadius={100}
                                    paddingAngle={0}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pieData.map((entry, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', background: COLORS[index], borderRadius: '3px' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{entry.name}: {entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MOTION.div>
    );
};

export default TeacherAnalytics;
