import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import * as XLSX from 'xlsx';
import { Plus, Search, Mail, Phone, Edit, Trash2, X, GraduationCap, MapPin, Calendar, BookOpen, FileSpreadsheet } from 'lucide-react';
import './Teachers.css';

const Teachers = () => {
    const { teachers, addTeacher, updateTeacher, deleteTeacher, classes, assignClassToTeacher, students, bulkAddTeachers } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [detailTeacher, setDetailTeacher] = useState(null);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', department: '', specialization: '', performance: '94%', office: 'Campus Building 4, Office 201', status: 'Active'
    });
    const [assignmentClassId, setAssignmentClassId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);

                    if (data.length > 0) {
                        if (confirm(`Found ${data.length} teachers in Excel. Start import?`)) {
                            const results = await bulkAddTeachers(data);
                            if (results) {
                                alert(`Successfully imported ${results.success} teachers! Failures: ${results.failed}`);
                            }
                        }
                    } else {
                        alert("No data found in the Excel file.");
                    }
                } catch (error) {
                    console.error("Excel processing error:", error);
                    alert("Error processing Excel file. Please ensure it is a valid .xlsx or .csv file.");
                }
            };
            reader.readAsBinaryString(file);
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing && editingTeacher) {
                if (!editingTeacher.id) {
                    alert("Error: Teacher ID is missing. Cannot update.");
                    setIsSaving(false);
                    return;
                }
                const success = await updateTeacher(editingTeacher.id, formData);
                if (success) {
                    // Update detail view if consistent
                    if (detailTeacher?.id === editingTeacher.id) {
                        setDetailTeacher({ ...detailTeacher, ...formData });
                    }
                    closeModal();
                } else {
                    alert("Failed to update teacher. Please check the console/server logs.");
                }
            } else {
                const success = await addTeacher(formData);
                if (success) {
                    closeModal();
                } else {
                    alert("Failed to add teacher. Please try again or check logs.");
                }
            }
        } catch (error) {
            console.error("Submit failed", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingTeacher(null);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', department: '', specialization: '', performance: '94%', office: 'Campus Building 4, Office 201', status: 'Active' });
        setIsModalOpen(true);
    };

    const openEditModal = (teacher) => {
        setIsEditing(true);
        setEditingTeacher(teacher);
        setFormData({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone,
            department: teacher.department,
            specialization: teacher.specialization || '',
            performance: teacher.performance || '94%',
            office: teacher.office || 'Campus Building 4, Office 201',
            status: teacher.status || 'Active'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingTeacher(null);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', department: '', specialization: '', performance: '94%', office: 'Campus Building 4, Office 201', status: 'Active' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            deleteTeacher(id);
            if (detailTeacher?.id === id) setDetailTeacher(null);
        }
    };

    const handleAssignClass = () => {
        if (detailTeacher && assignmentClassId) {
            assignClassToTeacher(detailTeacher.id, assignmentClassId);
            setAssignmentClassId('');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
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
                    <h1>Teacher Management</h1>
                    <p>Manage and monitor teaching staff</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportExcel}
                        accept=".xlsx, .xls, .csv"
                        style={{ display: 'none' }}
                    />
                    <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                        <FileSpreadsheet size={20} />
                        Import from Excel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary"
                        onClick={openAddModal}
                    >
                        <Plus size={20} />
                        Add New Teacher
                    </motion.button>
                </div>
            </div>

            <motion.div variants={itemVariants} className="filters-bar">
                <div className="search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search teachers by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="stats-row">
                <div className="summary-card">
                    <span className="label">Total Teachers</span>
                    <span className="value">{filteredTeachers.length}</span>
                </div>
                <div className="summary-card">
                    <span className="label">Active</span>
                    <span className="value text-green">{filteredTeachers.filter(t => t.status === 'Active').length}</span>
                </div>
                <div className="summary-card">
                    <span className="label">Avg. Classes</span>
                    <span className="value">{(filteredTeachers.reduce((acc, t) => acc + (t.assignedClasses?.length || 0), 0) / (filteredTeachers.length || 1)).toFixed(1)}</span>
                </div>
                <div className="summary-card">
                    <span className="label">Performance</span>
                    <span className="value text-blue">{(filteredTeachers.reduce((acc, t) => acc + parseFloat(t.performance || 0), 0) / (filteredTeachers.length || 1)).toFixed(0)}%</span>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="table-container shadow-hover">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Teacher</th>
                            <th>Contact</th>
                            <th>Classes</th>
                            <th>Students</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeachers.length > 0 ? (
                            filteredTeachers.map(teacher => (
                                <motion.tr
                                    key={teacher.id}
                                    whileHover={{ backgroundColor: '#F9FAFB' }}
                                    onClick={() => setDetailTeacher(teacher)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle">{teacher.firstName[0]}</div>
                                            <div>
                                                <p className="cell-title">{teacher.firstName} {teacher.lastName}</p>
                                                <p className="cell-subtitle">{teacher.department}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <p><Mail size={14} /> {teacher.email}</p>
                                            <p><Phone size={14} /> {teacher.phone}</p>
                                        </div>
                                    </td>
                                    <td>{teacher.assignedClasses?.length || 0}</td>
                                    <td>
                                        {classes
                                            .filter(c => teacher.assignedClasses?.includes(c.id))
                                            .reduce((acc, c) => {
                                                const enrolledCount = students.filter(s => s.enrolledClasses && s.enrolledClasses.includes(c.id)).length;
                                                return acc + enrolledCount;
                                            }, 0)}
                                    </td>
                                    <td><span className={`status-pill ${(teacher.status || 'Active').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>{teacher.status || 'Active'}</span></td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); openEditModal(teacher); }}><Edit size={18} /></button>
                                            <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(teacher.id); }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <Search size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                    <p>No teachers found matching your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

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
                                <h2>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                                <button onClick={closeModal} className="close-btn"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="John" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="teacher@classmind.ai" />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 234-567-8900" />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input name="department" value={formData.department} onChange={handleInputChange} required placeholder="e.g., Computer Science" />
                                    </div>
                                    <div className="form-group">
                                        <label>Specialization</label>
                                        <input name="specialization" value={formData.specialization} onChange={handleInputChange} required placeholder="e.g., AI/ML" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Performance (%)</label>
                                        <input name="performance" value={formData.performance} onChange={handleInputChange} required placeholder="94%" />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}>
                                            <option value="Active">Active</option>
                                            <option value="On Leave">On Leave</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Office Location</label>
                                    <input name="office" value={formData.office} onChange={handleInputChange} required placeholder="Campus Building 4, Office 201" />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={closeModal} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Teacher')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {detailTeacher && !isModalOpen && (
                    <div className="modal-overlay" onClick={() => setDetailTeacher(null)}>
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="detail-panel"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="detail-panel-header">
                                <button onClick={() => setDetailTeacher(null)} className="close-btn-round"><X size={20} /></button>
                                <div className="detail-hero">
                                    <div className="detail-avatar">{detailTeacher.firstName[0]}</div>
                                    <div className="detail-name-block">
                                        <h3>{detailTeacher.firstName} {detailTeacher.lastName}</h3>
                                        <p>{detailTeacher.department}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-body">
                                <div className="detail-section">
                                    <h4>Contact Information</h4>
                                    <div className="detail-info-item">
                                        <Mail size={18} />
                                        <span>{detailTeacher.email}</span>
                                    </div>
                                    <div className="detail-info-item">
                                        <Phone size={18} />
                                        <span>{detailTeacher.phone}</span>
                                    </div>
                                    <div className="detail-info-item">
                                        <MapPin size={18} />
                                        <span>{detailTeacher.office || 'Campus Building 4, Office 201'}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4>Teaching Profile</h4>
                                    <div className="stats-mini-grid">
                                        <div className="mini-stat">
                                            <BookOpen size={20} color="#3B82F6" />
                                            <div>
                                                <p className="mini-value">{detailTeacher.assignedClasses?.length || 0}</p>
                                                <p className="mini-label">Classes</p>
                                            </div>
                                        </div>
                                        <div className="mini-stat">
                                            <GraduationCap size={20} color="#A855F7" />
                                            <div>
                                                <p className="mini-value">
                                                    {classes
                                                        .filter(c => detailTeacher.assignedClasses?.includes(c.id))
                                                        .reduce((acc, c) => {
                                                            const enrolledCount = students.filter(s => s.enrolledClasses && s.enrolledClasses.includes(c.id)).length;
                                                            return acc + enrolledCount;
                                                        }, 0)}
                                                </p>
                                                <p className="mini-label">Students</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h4>Assigned Schedule</h4>
                                    {classes.filter(c => detailTeacher.assignedClasses?.includes(c.id)).length > 0 ? (
                                        classes.filter(c => detailTeacher.assignedClasses?.includes(c.id)).map(course => (
                                            <div key={course.id} className="schedule-item">
                                                <Calendar size={18} />
                                                <div>
                                                    <p className="schedule-title">{course.name}</p>
                                                    <p className="schedule-time">{course.schedule || 'Schedule TBD'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No classes assigned yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="detail-footer">
                                <button className="btn-secondary" onClick={() => {/* Message functionality placeholder */ }}>Message Teacher</button>
                                <button className="btn-primary" onClick={() => openEditModal(detailTeacher)}>Edit Profile</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Teachers;
