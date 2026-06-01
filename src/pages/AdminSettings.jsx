import React, { useState } from 'react';
import { motion as MOTION } from 'framer-motion';
import { Settings, Shield, Database, Bell, Save, Download, FileText, ToggleLeft } from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('system');

    const tabs = [
        { id: 'system', label: 'System Config', icon: Settings },
        { id: 'security', label: 'Audit Logs', icon: Shield },
        { id: 'data', label: 'Backup & Export', icon: Database },
        { id: 'notifications', label: 'Announcements', icon: Bell },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <MOTION.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="settings-page"
        >
            <div className="page-header">
                <div>
                    <h1>Administrative Controls</h1>
                    <p>Configure system-wide settings and manage platform data</p>
                </div>
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={20} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="settings-content">
                    {activeTab === 'system' && (
                        <MOTION.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-section">
                            <h3>General Configuration</h3>
                            <div className="settings-group">
                                <label>Academic Year</label>
                                <select defaultValue="2023-2024">
                                    <option>2023-2024</option>
                                    <option>2024-2025</option>
                                </select>
                            </div>
                            <div className="settings-group">
                                <label>System Language</label>
                                <select defaultValue="en">
                                    <option value="en">English (US)</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </select>
                            </div>
                            <div className="settings-group">
                                <div className="toggle-item">
                                    <span>Maintenance Mode</span>
                                    <div className="toggle-switch" />
                                </div>
                            </div>
                            <button className="btn-primary" style={{ marginTop: '20px' }}><Save size={18} /> Save Changes</button>
                        </MOTION.div>
                    )}

                    {activeTab === 'security' && (
                        <MOTION.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-section">
                            <h3>Audit Logs</h3>
                            <div className="log-list">
                                {[
                                    { user: 'Admin', action: 'Created new course CS401', time: '10 mins ago' },
                                    { user: 'Admin', action: 'Updated Teacher Sarah Johnson', time: '2 hours ago' },
                                    { user: 'System', action: 'Daily Backup Completed', time: '5 hours ago' },
                                ].map((log, i) => (
                                    <div key={i} className="log-item">
                                        <div className="log-info">
                                            <span className="log-user">{log.user}</span>
                                            <span className="log-action">{log.action}</span>
                                        </div>
                                        <span className="log-time">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </MOTION.div>
                    )}

                    {activeTab === 'data' && (
                        <MOTION.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-section">
                            <h3>Data Management</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Download current platform data for offline review or migration.</p>
                            <div className="data-actions">
                                <button className="data-card">
                                    <Download size={24} />
                                    <span>Export All Students (CSV)</span>
                                </button>
                                <button className="data-card">
                                    <Download size={24} />
                                    <span>Export Teacher Data (XLSX)</span>
                                </button>
                                <button className="data-card">
                                    <FileText size={24} />
                                    <span>Full System Backup (.sql)</span>
                                </button>
                            </div>
                        </MOTION.div>
                    )}

                    {activeTab === 'notifications' && (
                        <MOTION.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-section">
                            <h3>Global Announcements</h3>
                            <div className="settings-group">
                                <label>Banner Text</label>
                                <textarea placeholder="Welcome to ClassMind AI! Final exams start next week..." rows={4} />
                            </div>
                            <div className="settings-group">
                                <label>Target Audience</label>
                                <select defaultValue="all">
                                    <option value="all">Everyone</option>
                                    <option value="student">Students Only</option>
                                    <option value="teacher">Teachers Only</option>
                                </select>
                            </div>
                            <button className="btn-primary"><Bell size={18} /> Publish Announcement</button>
                        </MOTION.div>
                    )}
                </div>
            </div>
        </MOTION.div>
    );
};

export default AdminSettings;
