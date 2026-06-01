import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video, FileText, Download, Play, Clock, Users, ArrowLeft } from 'lucide-react';
import './ClassDetail.css';

const ClassDetail = () => {
    const { id } = useParams();
    const { getStudentData } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [materials, setMaterials] = useState([]);

    const studentData = getStudentData(currentUser?.email);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await fetch(`/api/materials/class/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMaterials(data);
                }
            } catch (err) {
                console.error("Failed to fetch materials", err);
            }
        };
        fetchMaterials();
    }, [id]);

    if (!studentData) {
        return (
            <div className="class-detail-page">
                <div className="breadcrumb">
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                <div className="hero-banner">
                    <h1>Loading Class Data...</h1>
                </div>
            </div>
        );
    }

    const course = studentData.classes?.find(c => c.id === id) || studentData.classes?.[0];

    if (!course) {
        return (
            <div className="class-detail-page">
                <div className="breadcrumb">
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                <div className="hero-banner">
                    <h1>Course Not Found</h1>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="class-detail-page"
        >
            <div className="breadcrumb">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            <div className="hero-banner">
                <div className="hero-content">
                    <div className="hero-main">
                        <h1>{course.name} <span className="course-code">{course.id}</span></h1>
                        <p className="description">{course.description}</p>

                        <div className="hero-meta">
                            <div className="meta-item">
                                <Users size={18} />
                                <span>{course.instructor}</span>
                            </div>
                            <div className="meta-item">
                                <Clock size={18} />
                                <span>{course.nextSession || 'TBD'}</span>
                            </div>
                            <div className="meta-item">
                                <Users size={18} />
                                <span>{course.studentsCount || 0} students</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-action">
                        <button className="btn-join">
                            <Video size={20} />
                            <span>Join Session</span>
                        </button>
                    </div>
                </div>

                <div className="progress-banner">
                    <div className="progress-header">
                        <span>Your Progress</span>
                        <span>{course.progress}%</span>
                    </div>
                    <div className="banner-bar">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            className="banner-fill"
                        />
                    </div>
                </div>
            </div>

            <div className="detail-grid">
                <div className="main-col">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="content-card"
                    >
                        <div className="card-header">
                            <FileText size={20} />
                            <h3>Learning Materials</h3>
                            <span className="count">{materials.length} materials</span>
                        </div>
                        <div className="materials-list">
                            {materials.map((m, i) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="material-item"
                                    onClick={() => navigate(`/material/${m.id}`)}
                                >
                                    <div className="file-icon">
                                        <FileText size={24} />
                                    </div>
                                    <div className="material-info">
                                        <h4>{m.title}</h4>
                                        <p>{m.format || 'Document'} • {m.accessedBy?.length || 0} Downloads</p>
                                    </div>
                                    <button className="btn-action-primary" onClick={(e) => { e.stopPropagation(); navigate(`/material/${m.id}`); }}>
                                        View AI Summary
                                    </button>
                                    <button className="btn-icon-gray" onClick={(e) => { 
                                            e.stopPropagation(); 
                                            window.open(`http://localhost:5003${m.fileUrl}`, '_blank');
                                        }}>
                                        <Download size={20} />
                                    </button>
                                </motion.div>
                            ))}
                            {materials.length === 0 && (
                                <p style={{ color: '#9CA3AF', padding: '1rem', textAlign: 'center' }}>No materials uploaded yet.</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                <div className="side-col">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="content-card"
                    >
                        <div className="card-header">
                            <Clock size={20} />
                            <h3>Upcoming Sessions</h3>
                        </div>
                        <div className="sessions-list">
                            <div className="session-item active">
                                <div className="session-time">
                                    <Clock size={16} />
                                    <span>Today • 10:00 AM - 11:30 AM</span>
                                </div>
                                <h4>Deep Learning Fundamentals</h4>
                                <p>Live Lecture</p>
                            </div>
                            <div className="session-item">
                                <div className="session-time">
                                    <Clock size={16} />
                                    <span>Wednesday • 10:00 AM - 11:30 AM</span>
                                </div>
                                <h4>Convolutional Networks</h4>
                                <p>Live Lecture</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ClassDetail;
