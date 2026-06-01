import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Brain, Layout, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MaterialDetail.css';

const MaterialDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();
    
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const res = await fetch(`/api/materials/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMaterial(data);
                }
            } catch (err) {
                console.error("Error fetching material", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterial();
    }, [id]);

    const handleDownload = async () => {
        if (!material) return;
        
        // Log access
        try {
            await fetch(`/api/materials/${id}/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: currentUser?.id || 'anonymous' })
            });
        } catch (e) {
            console.error("Failed to log access", e);
        }
        
        // Open file
        window.open(`http://localhost:5003${material.fileUrl}`, '_blank');
    };

    if (loading) {
        return <div style={{ color: 'white', padding: '2rem' }}>Loading material...</div>;
    }

    if (!material) {
        return (
            <div className="material-detail-page">
                <div className="breadcrumb">
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <ArrowLeft size={20} />
                        <span>Back to Materials</span>
                    </button>
                </div>
                <h2>Material Not Found</h2>
            </div>
        );
    }

    // Parse the bold/bullet points if AI formatted it that way
    const summaryLines = material.aiSummary ? material.aiSummary.split('\n').filter(l => l.trim()) : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="material-detail-page"
        >
            <div className="breadcrumb">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Back to Materials</span>
                </button>
            </div>

            <div className="material-hero">
                <div className="hero-top">
                    <div className="file-type-badge">
                        <FileText size={24} />
                    </div>
                    <h1>{material.title}</h1>
                    <button className="btn-download" onClick={handleDownload}>
                        <Download size={20} />
                        <span>Download {material.format}</span>
                    </button>
                </div>
                <div className="hero-meta">
                    <p>Course ID: {material.classId}</p>
                    <span className="dot">•</span>
                    <p>Uploaded: {new Date(material.uploadDate).toLocaleDateString()}</p>
                </div>
                <div className="hero-tags">
                    <span className="tag">{material.format}</span>
                    <span className="tag-ai">
                        <Brain size={16} />
                        AI Generated Summary
                    </span>
                    <span className="tag">{material.accessedBy?.length || 0} Views</span>
                </div>
            </div>

            <div className="material-content">
                <div className="content-section">
                    <div className="section-header">
                        <Layout size={20} color="#3B82F6" />
                        <h2>Description</h2>
                    </div>
                    <div className="summary-box">
                        <p>{material.description || "No description provided for this material."}</p>
                    </div>
                </div>

                <div className="content-section">
                    <div className="section-header">
                        <Brain size={20} color="#A855F7" />
                        <h2>AI Summary</h2>
                    </div>
                    {material.aiSummary ? (
                        <div className="points-list">
                            {summaryLines.map((line, idx) => (
                                <div className="point-item" key={idx}>
                                    <div className="point-num">{idx + 1}</div>
                                    <p>{line.replace(/^[•*\-\s]+/, '')}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="summary-box">
                            <p>No AI summary could be generated for this material.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MaterialDetail;
