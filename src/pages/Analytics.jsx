import React from 'react';
import { motion as MOTION } from 'framer-motion';
import { useData } from '../context/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Brain, Smile, Meh, Frown, TrendingUp, Filter, Calendar } from 'lucide-react';
import './TeacherAnalytics.css'; // Reusing the high-fidelity styles

const Analytics = () => {
    const { classes } = useData() || { classes: [] };

    // Aggregate stats across all classes
    const totalEngaged = classes.length > 0
        ? Math.round(classes.reduce((acc, c) => acc + (c.analytics?.summary?.engaged || 0), 0) / classes.length)
        : 85;
    const totalNeutral = classes.length > 0
        ? Math.round(classes.reduce((acc, c) => acc + (c.analytics?.summary?.neutral || 0), 0) / classes.length)
        : 12;
    const totalDisengaged = classes.length > 0
        ? Math.round(classes.reduce((acc, c) => acc + (c.analytics?.summary?.disengaged || 0), 0) / classes.length)
        : 3;

    const aggregatedSummary = {
        engaged: totalEngaged,
        neutral: totalNeutral,
        disengaged: totalDisengaged,
        improvement: 15 // Mock global improvement
    };

    // Prepare chart data: Emotional Feedback per Class
    const classComparisonData = classes.map(c => ({
        name: c.id,
        engaged: c.analytics?.summary?.engaged || 0,
        neutral: c.analytics?.summary?.neutral || 0,
        disengaged: c.analytics?.summary?.disengaged || 0
    }));

    return (
        <MOTION.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="teacher-analytics-page" // Using the same premium container style
            style={{ padding: '32px' }}
        >
            <div className="page-header">
                <div>
                    <h1>Institutional Emotion Report</h1>
                    <p>Aggregated emotional feedback and engagement metrics across all active courses</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} />
                        Filter Category
                    </button>
                </div>
            </div>

            <div className="analytics-summary-cards">
                <MOTION.div whileHover={{ y: -5 }} className="ana-card green">
                    <div className="card-top">
                        <Smile size={32} />
                        <span className="value">{aggregatedSummary.engaged}%</span>
                    </div>
                    <p className="label">Avg. Engaged Students</p>
                </MOTION.div>
                <MOTION.div whileHover={{ y: -5 }} className="ana-card yellow">
                    <div className="card-top">
                        <Meh size={32} />
                        <span className="value">{aggregatedSummary.neutral}%</span>
                    </div>
                    <p className="label">Avg. Neutral Response</p>
                </MOTION.div>
                <MOTION.div whileHover={{ y: -5 }} className="ana-card red">
                    <div className="card-top">
                        <Frown size={32} />
                        <span className="value">{aggregatedSummary.disengaged}%</span>
                    </div>
                    <p className="label">Avg. Disengaged</p>
                </MOTION.div>
                <MOTION.div whileHover={{ y: -5 }} className="ana-card blue">
                    <div className="card-top">
                        <TrendingUp size={32} />
                        <span className="value">+{aggregatedSummary.improvement}%</span>
                    </div>
                    <p className="label">System Improvement</p>
                </MOTION.div>
            </div>

            <div className="analytics-charts-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="chart-card">
                    <div className="chart-header">
                        <Brain size={20} color="#6366F1" />
                        <h3>Emotional Sentiment Comparison (By Class)</h3>
                    </div>
                    <div className="chart-container" style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="engaged" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={50} />
                                <Bar dataKey="neutral" stackId="a" fill="#F59E0B" />
                                <Bar dataKey="disengaged" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="dot engaged" /> Engaged</span>
                            <span className="legend-item"><span className="dot neutral" /> Neutral</span>
                            <span className="legend-item"><span className="dot disengaged" /> Disengaged</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-content-grid" style={{ marginTop: '32px' }}>
                <div className="table-container shadow-hover">
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Highest Engagement Classes</h3>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Class ID</th>
                                <th>Course Name</th>
                                <th>Instructor</th>
                                <th>Engaged</th>
                                <th>Trending</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((cls, idx) => (
                                <tr key={idx}>
                                    <td><span style={{ fontWeight: 700, color: '#6366F1' }}>{cls.id}</span></td>
                                    <td>{cls.name}</td>
                                    <td>{cls.instructorName}</td>
                                    <td>
                                        <div style={{ display: 'flex', items: 'center', gap: '8px' }}>
                                            <div style={{ width: '100px', height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                                                <div style={{ width: `${cls.analytics?.summary?.engaged || 0}%`, height: '100%', background: '#10B981' }} />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{cls.analytics?.summary?.engaged || 0}%</span>
                                        </div>
                                    </td>
                                    <td><span className="status-pill active">Up</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MOTION.div>
    );
};

export default Analytics;
