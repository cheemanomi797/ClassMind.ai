import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, LogOut, Brain, UserCheck, Bell, BarChart3, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const adminNavItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/teachers', label: 'Teachers', icon: UserCheck },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/classes', label: 'Classes', icon: BookOpen },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const studentNavItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/notifications', label: 'Notifications', icon: Bell },
    ];

    const teacherNavItems = [
        { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    const navItems = currentUser?.role === 'student'
        ? studentNavItems
        : currentUser?.role === 'teacher'
            ? teacherNavItems
            : adminNavItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="app-logo">
                    <div className="logo-icon-container">
                        <Brain size={24} color="white" />
                    </div>
                    <div className="logo-text">
                        <h2>ClassMind.ai</h2>
                        <span className="subtitle">
                            {currentUser?.role === 'student' ? 'Student Portal' : currentUser?.role === 'teacher' ? 'Teacher Portal' : 'Admin Portal'}
                        </span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} className="nav-icon" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-info">
                        <p className="user-name">{currentUser?.name || 'User'}</p>
                        <p className="user-email">{currentUser?.email || ''}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
