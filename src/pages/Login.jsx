import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Brain } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <div className="logo-wrapper">
                    <div className="logo-icon-bg">
                        <Brain size={32} color="white" />
                    </div>
                    <h1>ClassMind.ai</h1>
                </div>
                <p className="app-subtitle">AI-Powered Learning Management System</p>
            </div>

            <div className="login-card">
                <h2>Welcome Back</h2>
                <p className="card-subtitle">Sign in to continue</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn">Sign In</button>
                </form>

                <div className="login-footer-line"></div>
            </div>
        </div>
    );
};

export default Login;
