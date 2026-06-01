import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertTriangle, FileText, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudentNotifications.css';

const StudentNotifications = () => {
    const { getStudentData } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const studentData = getStudentData(currentUser?.email);

    if (!studentData) {
        return (
            <div className="notifications-page">
                <div className="page-header">
                    <h1>Notifications</h1>
                    <p>Loading your updates...</p>
                </div>
            </div>
        );
    }

    const notifications = studentData.notifications || [];

    const filtered = filter === 'all'
        ? notifications
        : notifications.filter(n => n.unread);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="notifications-page"
        >
            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p>Stay updated with class schedules and new materials</p>
                </div>
                <button className="btn-text">Mark all as read</button>
            </div>

            <div className="stats-header">
                <div className="stat-pill border-blue">
                    <Bell size={20} color="#3B82F6" />
                    <div>
                        <span className="pill-value">{notifications.length}</span>
                        <span className="pill-label">Total</span>
                    </div>
                </div>
                <div className="stat-pill border-orange">
                    <AlertTriangle size={20} color="#F97316" />
                    <div>
                        <span className="pill-value">{notifications.filter(n => n.unread).length}</span>
                        <span className="pill-label">Unread</span>
                    </div>
                </div>
                <div className="stat-pill border-green">
                    <Check size={20} color="#10B981" />
                    <div>
                        <span className="pill-value">{notifications.filter(n => !n.unread).length}</span>
                        <span className="pill-label">Read</span>
                    </div>
                </div>
            </div>

            <div className="notifications-list-container">
                <div className="filter-tabs">
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        className={`tab ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({notifications.filter(n => n.unread).length})
                    </button>
                </div>

                <div className="notifications-list">
                    <AnimatePresence>
                        {filtered.map((note) => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`notification-card ${note.unread ? 'unread' : ''}`}
                                onClick={() => {
                                    if (note.type === 'material') {
                                        navigate(`/material/${note.id}`);
                                    } else {
                                        navigate(`/class/${note.code}`);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={`icon-circle ${note.type}`}>
                                    {note.type === 'reschedule' ? <Bell size={20} /> : <FileText size={20} />}
                                </div>
                                <div className="note-content">
                                    <h3 className="note-title">
                                        {note.title}
                                        {note.unread && <span className="unread-dot" />}
                                    </h3>
                                    <p className="note-message">{note.message}</p>
                                    <div className="note-meta">
                                        <span className="note-code">{note.code}</span>
                                        <span className="note-time">{note.time}</span>
                                    </div>
                                </div>
                                <div className="note-actions">
                                    <button className="btn-circle-action"><Check size={18} /></button>
                                    <button className="btn-circle-action delete"><X size={18} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentNotifications;
