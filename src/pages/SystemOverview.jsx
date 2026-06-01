import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, BookOpen, Activity, TrendingUp, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './SystemOverview.css';

import { useData } from '../context/DataContext';

const SystemOverview = () => {
    const { dashboardStats, loading, students, classes } = useData();

    // Calculate Dynamic Chart Data
    const getWeeklyData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyCount = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

        students.forEach(s => {
            const date = s.enrollmentDate ? new Date(s.enrollmentDate) : new Date();
            const dayName = days[date.getDay()];
            weeklyCount[dayName]++;
        });

        return days.map(day => ({ name: day, users: weeklyCount[day] }));
    };

    const getBarData = () => {
        return classes.slice(0, 6).map(cls => ({
            name: cls.id,
            count: cls.studentsCount || 0
        }));
    };

    const lineData = getWeeklyData();
    const barData = getBarData();

    const stats = [
        { label: 'Total Students', value: dashboardStats?.totalStudents.toString() || '0', status: 'Updated', icon: Users, color: '#3B82F6', border: 'rgba(59, 130, 246, 0.5)' },
        { label: 'Active Teachers', value: dashboardStats?.activeTeachers.toString() || '0', status: 'Live', icon: UserCheck, color: '#A855F7', border: 'rgba(168, 85, 247, 0.5)' },
        { label: 'Active Classes', value: dashboardStats?.activeClasses.toString() || '0', status: 'Live', icon: BookOpen, color: '#6366F1', border: 'rgba(99, 102, 241, 0.5)' },
        { label: 'Active Sessions', value: (dashboardStats?.activeClasses || 0).toString(), status: 'Live', icon: Activity, color: '#EC4899', border: 'rgba(236, 72, 153, 0.5)' },
    ];

    if (loading) return <div className="loading-container">Loading overview...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overview-container"
        >
            <div className="overview-header">
                <h1>System Overview</h1>
                <p>Monitor and manage your learning platform</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        className="stat-card"
                        style={{ borderLeft: `3px solid ${stat.color}` }}
                    >
                        <div className="stat-card-top">
                            <div className="stat-icon-bg" style={{ color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            {stat.growth && <span className="growth-badge">{stat.growth}</span>}
                            {stat.status && <span className="status-badge-live">{stat.status}</span>}
                        </div>
                        <div className="stat-card-bottom">
                            <h2 className="stat-value">{stat.value}</h2>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="charts-grid">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="chart-card"
                >
                    <div className="chart-card-header">
                        <div className="title-with-icon">
                            <LineIcon size={20} color="#A855F7" />
                            <h3>Student Enrollment Distribution</h3>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#A855F7"
                                    strokeWidth={3}
                                    dot={{ fill: '#A855F7', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="chart-card"
                >
                    <div className="chart-card-header">
                        <div className="title-with-icon">
                            <BarChart3 size={20} color="#3B82F6" />
                            <h3>Class Enrollment Overview</h3>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SystemOverview;
