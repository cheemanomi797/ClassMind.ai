import React from 'react';
import { motion as MOTION } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './TeacherStudentTracking.css';

const TeacherStudentTracking = () => {
    const { getTeacherData } = useData();
    const { currentUser } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();

    const teacherData = getTeacherData(currentUser?.email) || { courses: [] };
    const course = teacherData.courses?.find(c => c.id === courseId) || teacherData.courses?.[0];

    if (!course) {
        return (
            <div className="student-tracking-page">
                <div className="page-header">
                    <h1>Tracking Data Not Found</h1>
                    <button onClick={() => navigate('/teacher/dashboard')} className="btn-primary">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const tracking = course.tracking || [];

    const getStatusColor = (val) => {
        if (val >= 90) return 'green';
        if (val >= 75) return 'yellow';
        return 'red';
    };

    return (
        <MOTION.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="student-tracking-page"
        >
            <div className="breadcrumb">
                <button onClick={() => navigate(`/teacher/course/${course.id}`)} className="btn-back">
                    <ArrowLeft size={18} />
                    <span>Back to {course.id}</span>
                </button>
            </div>

            <div className="page-header">
                <div>
                    <h1>Individual Student Tracking</h1>
                </div>
            </div>

            <div className="tracking-table-container">
                <table className="tracking-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Attendance</th>
                            <th>Participation</th>
                            <th>Engagement</th>
                            <th>Assignments</th>
                            <th style={{ textAlign: 'center' }}>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracking.map((student, idx) => {
                            const colors = ['#6366F1', '#A855F7', '#6366F1', '#3B82F6', '#6366F1', '#A855F7', '#6366F1'];
                            return (
                                <MOTION.tr
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <td>
                                        <div className="student-cell">
                                            <div className="avatar" style={{ background: colors[idx % colors.length] }}>
                                                {(student.name || 'S').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="name">{student.name}</p>
                                                <p className="email">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="progress-container">
                                            <div className={`status-dot ${getStatusColor(student.attendance)}`} />
                                            <div className="val-text">{student.attendance}%</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="progress-container">
                                            <div className={`status-dot ${getStatusColor(student.participation)}`} />
                                            <div className="val-text">{student.participation}%</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="progress-container">
                                            <div className={`status-dot ${getStatusColor(student.engagement)}`} />
                                            <div className="val-text">{student.engagement}%</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="assignments-val">{student.assignments}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`trend-badge ${(student.trend || 'Stable').toLowerCase()}`}>
                                            {student.trend === 'Improving' && '↑ '}
                                            {student.trend}
                                        </span>
                                    </td>
                                </MOTION.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </MOTION.div>
    );
};

export default TeacherStudentTracking;
