import React from 'react';
import { motion as MOTION } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Smile, Meh, Frown, Calendar, BookOpen } from 'lucide-react';
import './AdminCourseAnalytics.css';

const AdminCourseAnalytics = () => {
    const { classes, students, unenrollStudentFromClass } = useData() || { classes: [], students: [], unenrollStudentFromClass: () => { } };
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Fallback logic to ensure we always show data (match teacher portal resilience)
    const course = classes.find(c => c.id === courseId) || classes[0];

    if (!course) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <h1>No Course Data Available</h1>
                    <button onClick={() => navigate('/classes')} className="btn-primary">Back to Classes</button>
                </div>
            </div>
        );
    }

    // Derive enrolled students from the global students list (Source of Truth)
    const enrolledStudents = students.filter(s => s.enrolledClasses && s.enrolledClasses.includes(course.id));

    // Merge with existing tracking data if available
    const extendedTracking = enrolledStudents.map(student => {
        const trackRecord = course.tracking?.find(t => String(t.id) === String(student.id) || t.email === student.email) || {};
        return {
            ...student,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            engagement: trackRecord.engagement || 0,
            attendance: trackRecord.attendance || 0,
            trend: trackRecord.trend || 'Stable'
        };
    });

    // If no students are enrolled, we can fall back to the tracking list if it has data (orphaned stats)
    // But generally, the student list is safer.
    const displayList = extendedTracking.length > 0 ? extendedTracking : (course.tracking || []);

    const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
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
            className="page-container"
        >
            <div className="breadcrumb" style={{ marginBottom: '16px' }}>
                <button onClick={() => navigate('/classes')} className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>
                    <ArrowLeft size={20} />
                    <span>Back to Classes</span>
                </button>
            </div>

            {/* Upper Side: Course Info */}
            <div className="course-header-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--text-dark)' }}>{course.name} <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 400 }}>{course.id}</span></h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '600px', lineHeight: '1.5' }}>{course.description || 'No description available for this course.'}</p>

                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                <div className="avatar-circle-sm" style={{ width: '28px', height: '28px', fontSize: '0.8rem', background: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                    {(course.instructorName || 'T')[0]}
                                </div>
                                <span style={{ fontWeight: 500 }}>{course.instructorName || 'Instructor TBD'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                <Calendar size={18} />
                                <span>{course.schedule || 'Schedule TBD'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="analytics-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px' }}>

                {/* Left Side: Week-wise Engagement Graph */}
                <div className="chart-card" style={{ height: 'fit-content' }}>
                    <div className="chart-header">
                        <TrendingUp size={20} color="#3B82F6" />
                        <h3>Overall Student Engagement (Weekly)</h3>
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
                                <Line type="monotone" dataKey="engaged" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Engaged" />
                                <Line type="monotone" dataKey="neutral" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Neutral" />
                                <Line type="monotone" dataKey="disengaged" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Disengaged" />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '16px' }}>
                            <span className="legend-item"><span className="dot engaged" /> Engaged</span>
                            <span className="legend-item"><span className="dot neutral" /> Neutral</span>
                            <span className="legend-item"><span className="dot disengaged" /> Disengaged</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Enrolled Student List */}
                <div className="table-container shadow-hover" style={{ height: 'fit-content', maxHeight: '500px', overflowY: 'auto', overflowX: 'auto' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, left: 0, background: 'white', zIndex: 10, minWidth: '400px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Enrolled Students</h3>
                        <span className="badge" style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                            {displayList.length}
                        </span>
                    </div>
                    {displayList.length > 0 ? (
                        <table className="data-table" style={{ width: '100%', minWidth: '500px' }}>
                            <thead style={{ position: 'sticky', top: '65px', background: '#F9FAFB', zIndex: 9 }}>
                                <tr>
                                    <th style={{ paddingLeft: '24px' }}>Name</th>
                                    <th>ID</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayList.map(student => (
                                    <tr key={student.id}>
                                        <td style={{ paddingLeft: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.8rem', minWidth: '28px' }}>{student.name ? student.name[0] : 'S'}</div>
                                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{student.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: '#6B7280', fontFamily: 'monospace' }}>
                                            {student.studentId || '-'}
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                            {student.email || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <BookOpen size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                            <p>No students enrolled yet.</p>
                        </div>
                    )}

                </div>
            </div>
        </MOTION.div>
    );
};

export default AdminCourseAnalytics;
