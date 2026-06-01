import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Calendar, Clock, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './TeacherReschedule.css';

const TeacherReschedule = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();

    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="teacher-reschedule-page"
        >
            <div className="breadcrumb">
                <button onClick={() => navigate(`/teacher/course/${courseId}`)} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Back to {courseId}</span>
                </button>
            </div>

            <div className="page-header">
                <div>
                    <h1>New Schedule</h1>
                    <p>Adjust class timings and notify all enrolled students</p>
                </div>
            </div>

            <div className="reschedule-form-card">
                <div className="form-section">
                    <label>Select Class Days</label>
                    <div className="days-selector">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <button key={day} className={`day-pill ${day === 'Monday' || day === 'Wednesday' ? 'selected' : ''}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-section">
                        <label>Start Time</label>
                        <div className="input-with-icon">
                            <Clock size={18} />
                            <input type="text" placeholder="10:00 AM" />
                        </div>
                    </div>
                    <div className="form-section">
                        <label>End Time</label>
                        <div className="input-with-icon">
                            <Clock size={18} />
                            <input type="text" placeholder="11:30 AM" />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <label>Effective From</label>
                    <div className="input-with-icon">
                        <Calendar size={18} />
                        <input type="text" placeholder="Select start date" />
                    </div>
                </div>

                <div className="form-section">
                    <label>Reason for Rescheduling (Optional)</label>
                    <textarea placeholder="Provide a brief explanation for students..."></textarea>
                </div>

                <div className="notify-banner">
                    <Bell size={20} color="#3B82F6" />
                    <div>
                        <h4>Notify Students</h4>
                        <p>Send email and in-app notifications to all 45 enrolled students about this schedule change</p>
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                    <button className="btn-primary-large">Confirm Reschedule</button>
                </div>
            </div>
        </Motion.div>
    );
};

export default TeacherReschedule;
