import * as XLSX from 'xlsx';
import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Search, Mail, Edit, Trash2, X, BookOpen, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Teachers.css';

const Students = () => {
    const { students, addStudent, updateStudent, deleteStudent, classes, enrollStudentInClass, unenrollStudentFromClass, bulkAddStudents } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [detailStudent, setDetailStudent] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', studentId: '', program: '', year: '', enrollmentDate: '', status: 'Active', progress: '0%'
    });
    const [enrollmentClassId, setEnrollmentClassId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Derive the most up-to-date student object from context to ensure UI updates immediately
    const activeStudent = detailStudent ? students.find(s => s.id === detailStudent.id) : null;

    const filteredStudents = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        alert(`Found ${data.length} students in Excel. Starting import...`);
                        const results = await bulkAddStudents(data);
                        if (results) {
                            alert(`Successfully imported ${results.success} students! Failures: ${results.failed}`);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing && editingStudent) {
                if (!editingStudent.id) {
                    alert("Error: Student ID is missing. Cannot update.");
                    setIsSaving(false);
                    return;
                }
                await updateStudent(editingStudent.id, formData);

                // If the detail panel is open for this student, update it locally too
                if (detailStudent?.id === editingStudent.id) {
                    setDetailStudent(prev => ({ ...prev, ...formData }));
                }

                closeModal();
            } else {
                await addStudent(formData);
                closeModal();
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
        setEditingStudent(null);
        setFormData({ firstName: '', lastName: '', email: '', studentId: '', program: '', year: '', enrollmentDate: '', status: 'Active', progress: '0%' });
        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setIsEditing(true);
        setEditingStudent(student);
        setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            studentId: student.studentId,
            program: student.program,
            year: student.year,
            enrollmentDate: student.enrollmentDate || '',
            status: student.status || 'Active',
            progress: student.progress || '0%'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingStudent(null);
        setFormData({ firstName: '', lastName: '', email: '', studentId: '', program: '', year: '', enrollmentDate: '', status: 'Active', progress: '0%' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            deleteStudent(id);
            if (detailStudent?.id === id) setDetailStudent(null);
        }
    };

    const handleEnroll = async () => {
        if (activeStudent && enrollmentClassId) {
            await enrollStudentInClass(activeStudent.id, enrollmentClassId);
            setEnrollmentClassId('');
        }
    };

    const handleUnenroll = async (classId) => {
        if (window.confirm('Are you sure you want to unenroll the student from this class?')) {
            await unenrollStudentFromClass(activeStudent.id, classId);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Student Management</h1>
                    <p>Manage and monitor student enrollments</p>
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
                    <button className="btn-primary" onClick={openAddModal}>
                        <Plus size={20} />
                        Add New Student
                    </button>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search students by name, email or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>ID & Email</th>
                            <th>Program</th>
                            <th>Year</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.id} onClick={() => setDetailStudent(student)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle" style={{ background: '#3B82F6' }}>{student.firstName[0]}</div>
                                            <div>
                                                <p className="cell-title">{student.firstName} {student.lastName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <p style={{ fontWeight: 600, color: '#4B5563' }}>{student.studentId}</p>
                                            <p><Mail size={14} /> {student.email}</p>
                                        </div>
                                    </td>
                                    <td>{student.program}</td>
                                    <td>{student.year}</td>
                                    <td><span className={`status-pill ${(student.status || 'Active').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>{student.status || 'Active'}</span></td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); openEditModal(student); }}><Edit size={18} /></button>
                                            <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <Search size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                    <p>No students found matching your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                                <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
                                <button onClick={closeModal} className="close-btn"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="Jane" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="student@student.edu" />
                                </div>

                                <div className="form-group">
                                    <label>Student ID</label>
                                    <input name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="STU2024001" />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Program</label>
                                        <input name="program" value={formData.program} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Year</label>
                                        <input name="year" value={formData.year} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Enrollment Date</label>
                                    <input name="enrollmentDate" type="date" value={formData.enrollmentDate} onChange={handleInputChange} required />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}>
                                            <option value="Active">Active</option>
                                            <option value="Suspended">Suspended</option>
                                            <option value="Graduated">Graduated</option>
                                            <option value="Withdrawn">Withdrawn</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Progress (%)</label>
                                        <input name="progress" value={formData.progress} onChange={handleInputChange} required placeholder="0%" />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={closeModal} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Student')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {activeStudent && !isModalOpen && (
                    <div className="modal-overlay" onClick={() => setDetailStudent(null)}>
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="detail-panel"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="detail-panel-header">
                                <button onClick={() => setDetailStudent(null)} className="close-btn-round"><X size={20} /></button>
                                <div className="detail-hero">
                                    <div className="detail-avatar">{activeStudent.firstName[0]}</div>
                                    <div className="detail-name-block">
                                        <h3>{activeStudent.firstName} {activeStudent.lastName}</h3>
                                        <p>{activeStudent.program} • {activeStudent.year}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-body">
                                <div className="detail-section">
                                    <h4>Student Information</h4>
                                    <div className="detail-info-item">
                                        <Mail size={18} />
                                        <span>{activeStudent.email}</span>
                                    </div>
                                    <div className="detail-info-item">
                                        <span style={{ fontWeight: 600 }}>ID:</span>
                                        <span style={{ marginLeft: '8px' }}>{activeStudent.studentId}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4>Enrolled Classes</h4>
                                    {classes.filter(c => activeStudent.enrolledClasses?.includes(c.id)).length > 0 ? (
                                        classes.filter(c => activeStudent.enrolledClasses?.includes(c.id)).map(course => (
                                            <div key={course.id} className="schedule-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <BookOpen size={18} />
                                                    <div>
                                                        <p className="schedule-title">{course.name}</p>
                                                        <p className="schedule-time">{course.instructorName || 'Instructor TBD'} • {course.schedule || 'Schedule TBD'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnenroll(course.id)}
                                                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Not enrolled in any classes.</p>
                                    )}
                                </div>

                                <div className="detail-section">
                                    <h4>Enroll in New Class</h4>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        <select
                                            value={enrollmentClassId}
                                            onChange={(e) => setEnrollmentClassId(e.target.value)}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        >
                                            <option value="">Select a class...</option>
                                            {classes.filter(c => !activeStudent.enrolledClasses?.includes(c.id)).map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                            ))}
                                        </select>
                                        <button className="btn-primary" onClick={handleEnroll} disabled={!enrollmentClassId}>Enroll</button>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-footer">
                                <button className="btn-secondary">Message Student</button>
                                <button className="btn-primary" onClick={() => openEditModal(activeStudent)}>Edit Profile</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Students;
