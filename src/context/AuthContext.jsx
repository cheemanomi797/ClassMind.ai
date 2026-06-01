import React, { createContext, useState, useContext, useEffect } from 'react';
import { DataContext } from './DataContext'; // Assuming named export matches or adjustment needed

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const data = useContext(DataContext);
    const validateUser = data ? data.validateUser : null;

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('classmind_user');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Local storage access failed", e);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const user = await validateUser(email, password);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('classmind_user', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('classmind_user');
    };

    const value = {
        currentUser,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
