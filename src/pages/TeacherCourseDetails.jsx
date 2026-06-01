import React from 'react';
import { motion as MOTION } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, Upload, BarChart3, Calendar, ArrowLeft, Clock, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './TeacherCourseDetails.css';

const TeacherCourseDetails = () => {
    const { getTeacherData } = useData();
    const { currentUser } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();

    const teacherData = getTeacherData(currentUser?.email) || { courses: [] };
    const course = teacherData.courses?.find(c => c.id === courseId) || teacherData.courses?.[0];

    if (!course) {
        return (
            <div className="course-details-page">
                <div className="page-header">
                    <h1>Course Not Found</h1>
                    <button onClick={() => navigate('/teacher/dashboard')} className="btn-primary">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const tracking = course.tracking || [];
    const recentActivity = course.recentActivity || [];

    const actions = [
        { title: 'Upload Material', desc: 'Add lecture slides & PDFs', icon: Upload, color: '#3B82F6', path: `/teacher/course/${course.id}/upload` },
        { title: 'Emotion Analytics', desc: 'Real-time engagement data', icon: BarChart3, color: '#A855F7', path: `/teacher/course/${course.id}/analytics` },
        { title: 'Reschedule', desc: 'Manage class timings', icon: Calendar, color: '#6366F1', path: `/teacher/course/${course.id}/reschedule` },
        { title: 'Student Tracking', desc: 'Monitor participation', icon: UserCheck, color: '#EC4899', path: `/teacher/course/${course.id}/tracking` },
    ];

    return (
        <MOTION.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="course-details-page"
        >
            <div className="breadcrumb">
                <button onClick={() => navigate('/teacher/dashboard')} className="btn-back">
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            <div className="details-header">
                <div>
                    <h1>{course.name} <span className="course-code">{course.id}</span></h1>
                    <p>{course.description}</p>
                </div>
            </div>

            <div className="course-stats-row">
                <div className="stat-item">
                    <div className="stat-icon"><Calendar size={20} /></div>
                    <div>
                        <span className="stat-label">Next Session</span>
                        <span className="stat-value">{course.schedule || 'TBD'}</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon"><Users size={20} /></div>
                    <div>
                        <span className="stat-label">Enrolled</span>
                        <span className="stat-value">{course.studentsCount || tracking.length} Students</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon"><Clock size={20} /></div>
                    <div>
                        <span className="stat-label">Avg Participation</span>
                        <span className="stat-value">{course.participation || 88}%</span>
                    </div>
                </div>
            </div>

            <div className="actions-grid">
                {actions.map((action, i) => (
                    <div key={i} className="details-action-card" onClick={() => navigate(action.path)}>
                        <div className="action-icon-wrapper" style={{ background: `${action.color}15`, color: action.color, width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                            <action.icon size={28} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3>{action.title}</h3>
                            <p>{action.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="details-content-grid">
                <div className="white-card">
                    <div className="card-header">
                        <h2>Enrolled Students</h2>
                        <span className="student-count-pill" style={{ position: 'static' }}>{tracking.length} Students</span>
                    </div>
                    <table className="student-table-mini">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Attendance</th>
                                <th>Participation</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracking.map((student, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="student-info-cell">
                                            <div className="mini-avatar" style={{ background: idx % 2 === 0 ? '#3B82F6' : '#A855F7' }}>
                                                {(student.name || 'S').charAt(0)}
                                            </div>
                                            <div>
                                                <span className="mini-name">{student.name}</span>
                                                <span className="mini-email">{student.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{student.attendance}%</td>
                                    <td style={{ fontWeight: 600 }}>{student.participation || 85}%</td>
                                    <td><span className="status-pill active">Good</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="white-card">
                    <div className="card-header">
                        <h2>Recent Activity</h2>
                    </div>
                    <div className="timeline">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="timeline-item">
                                <div className={`timeline-dot ${activity.type || 'upload'}`} />
                                <div className="timeline-content">
                                    <p>{activity.title}</p>
                                    <span>{activity.time}</span>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p>No recent activity recorded.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MOTION.div>
    );
};

export default TeacherCourseDetails;
