import React, { useState } from 'react';
import { Plus, Users, BookOpen, MoreHorizontal, Calendar, X, Trash2, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './Classes.css';

const Classes = () => {
    const { classes, addClass, updateClass, deleteClass, teachers, assignClassToTeacher, students } = useData();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [formData, setFormData] = useState({
        id: '', name: '', description: '', schedule: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing && selectedClass) {
            updateClass(selectedClass.id, formData);
        } else {
            addClass(formData);
        }
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setSelectedClass(null);
        setFormData({ id: '', name: '', description: '', schedule: '' });
    };

    const openEditModal = (cls) => {
        setIsEditing(true);
        setSelectedClass(cls);
        setFormData({
            id: cls.id,
            name: cls.name,
            description: cls.description || '',
            schedule: cls.schedule || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            deleteClass(id);
        }
    };

    const handleInstructorChange = (classId, teacherId) => {
        if (teacherId) {
            assignClassToTeacher(parseInt(teacherId), classId);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="page-container"
        >
            <div className="page-header">
                <div>
                    <h1>Classes</h1>
                    <p>Schedule and manage your active courses</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={20} />
                    Create Class
                </motion.button>
            </div>

            <div className="classes-grid">
                {classes.map((cls) => {
                    const enrolledCount = students.filter(s => s.enrolledClasses && s.enrolledClasses.includes(cls.id)).length;
                    return (
                        <motion.div
                            key={cls.id}
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            className="class-card"
                        >
                            <div className="class-card-header">
                                <div className={`status-tag ${cls.status.toLowerCase()}`}>
                                    {cls.status}
                                </div>
                                <div className="card-actions-mini" style={{ display: 'flex', gap: '8px' }}>
                                    <button className="icon-btn-small" onClick={() => openEditModal(cls)}><Edit size={16} /></button>
                                    <button className="icon-btn-small delete" onClick={() => handleDelete(cls.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="class-card-body">
                                <h3 className="class-name">{cls.name}</h3>
                                <div className="class-info-list">
                                    <div className="info-item">
                                        <Users size={16} />
                                        <select
                                            className="instructor-select"
                                            value={cls.instructorId || ''}
                                            onChange={(e) => handleInstructorChange(cls.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ border: 'none', background: 'transparent', fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit', outline: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="">Assign Instructor...</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="info-item">
                                        <BookOpen size={16} />
                                        <span>{enrolledCount} Enrolled</span>
                                    </div>
                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <span>{cls.schedule}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="class-card-footer">
                                <button className="view-details-btn" onClick={() => navigate(`/admin/course/${cls.id}/analytics`)}>View Analytics</button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                        >
                            <div className="modal-header">
                                <h2>{isEditing ? 'Edit Class' : 'Create New Class'}</h2>
                                <button onClick={closeModal} className="close-btn"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Class ID</label>
                                    <input name="id" value={formData.id} onChange={handleInputChange} required placeholder="e.g., CS401" disabled={isEditing} />
                                </div>
                                <div className="form-group">
                                    <label>Class Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Introduction to AI" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief details about the class..." />
                                </div>
                                <div className="form-group">
                                    <label>Schedule</label>
                                    <input name="schedule" value={formData.schedule} onChange={handleInputChange} placeholder="e.g., Mon, Wed 10:00 AM" />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 600 }}>
                                        {isEditing ? 'Save Changes' : 'Create Class'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Classes;
