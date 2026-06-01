import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Upload, Brain, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TeacherUpload.css';

const TeacherUpload = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { currentUser } = useAuth();
    
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (!title) {
                // Auto-fill title from filename
                setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !title) {
            setErrorMsg("Please provide a title and select a file.");
            return;
        }

        setIsUploading(true);
        setErrorMsg('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('classId', courseId);
            formData.append('teacherId', currentUser?.id || 'TCH001');

            const res = await fetch('/api/materials/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => navigate(`/teacher/course/${courseId}`), 2000);
            } else {
                const data = await res.json();
                setErrorMsg(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            setErrorMsg('Network error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="teacher-upload-page"
        >
            <div className="breadcrumb">
                <button onClick={() => navigate(`/teacher/course/${courseId}`)} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Back to {courseId}</span>
                </button>
            </div>

            <div className="page-header">
                <div>
                    <h1>Upload Learning Material</h1>
                    <p>Upload lecture slides and let AI generate summaries automatically</p>
                </div>
            </div>

            <div className="upload-container-card">
                <div className="upload-header">
                    <div className="upload-icon-main">
                        <Upload size={32} color="white" />
                    </div>
                    <h2>Upload Course Material</h2>
                    <p>Supported formats: PDF, PPT, PPTX</p>
                </div>

                {success ? (
                    <div className="success-message" style={{ textAlign: 'center', padding: '2rem' }}>
                        <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                        <h3>Upload Successful!</h3>
                        <p>AI summary generated. Redirecting to course...</p>
                    </div>
                ) : (
                    <>
                        <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Lecture Title *</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter lecture title"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #374151', background: '#1F2937', color: 'white' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description (Optional)</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a brief description"
                                rows="3"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #374151', background: '#1F2937', color: 'white' }}
                            />
                        </div>

                        <div className="dropzone" style={{ position: 'relative', marginTop: '1rem' }}>
                            <input 
                                type="file" 
                                accept=".pdf,.ppt,.pptx"
                                onChange={handleFileChange}
                                style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                    opacity: 0, cursor: 'pointer'
                                }}
                            />
                            <Upload size={48} color={file ? "#10B981" : "#9CA3AF"} />
                            <p className="drop-text" style={{ color: file ? "#10B981" : "#9CA3AF" }}>
                                {file ? `Selected: ${file.name}` : "Click to upload or drag and drop"}
                            </p>
                            <p className="max-size">Maximum file size: 50MB</p>
                        </div>

                        {errorMsg && <p style={{ color: '#EF4444', marginTop: '1rem' }}>{errorMsg}</p>}

                        <div className="ai-notice">
                            <div className="notice-icon">
                                <Brain size={20} color="#3B82F6" />
                            </div>
                            <div>
                                <h4>AI-Powered Summarization</h4>
                                <p>Once uploaded, our AI will automatically generate a comprehensive summary of your lecture slides for students to review.</p>
                            </div>
                        </div>

                        <div className="upload-actions">
                            <button className="btn-cancel" onClick={() => navigate(-1)} disabled={isUploading}>Cancel</button>
                            <button className="btn-primary-large" onClick={handleUpload} disabled={isUploading || !file}>
                                {isUploading ? 'Uploading & Analyzing...' : 'Start Upload'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Motion.div>
    );
};

export default TeacherUpload;
