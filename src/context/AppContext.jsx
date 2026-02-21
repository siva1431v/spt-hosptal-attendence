import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Authentication State
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('hospital_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isAuthenticated = !!user;

    const login = (email, password) => {
        if (email && password) {
            const loggedInUser = { email, name: email.split('@')[0] || 'User' };
            setUser(loggedInUser);
            localStorage.setItem('hospital_user', JSON.stringify(loggedInUser));
            return true;
        }
        return false;
    };

    const signup = (name, email, password) => {
        if (name && email && password) {
            const newUser = { name, email };
            setUser(newUser);
            localStorage.setItem('hospital_user', JSON.stringify(newUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hospital_user');
    };

    // Mock Data for Initial Load
    const [staff, setStaff] = useState([
        { id: '1', name: 'Dr. Sarah Smith', role: 'Cardiologist', baseSalary: 120000, status: 'Active' },
        { id: '2', name: 'Dr. John Doe', role: 'Pediatrician', baseSalary: 95000, status: 'Active' },
        { id: '3', name: 'Emily Chen', role: 'Senior Nurse', baseSalary: 45000, status: 'Active' },
        { id: '4', name: 'Michael Brown', role: 'Technician', baseSalary: 35000, status: 'Active' },
        { id: '5', name: 'Jessica Davis', role: 'Receptionist', baseSalary: 25000, status: 'Active' }
    ]);

    // Attendance Data: structure { 'YYYY-MM-DD': { staffId: 'Present' | 'Absent' | 'Half-day' } }
    const [attendance, setAttendance] = useState({
        [new Date().toISOString().split('T')[0]]: {
            '1': 'Present',
            '2': 'Present',
            '3': 'Half-day',
            '4': 'Absent',
            '5': 'Present'
        }
    });

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addStaff = (newStaff) => {
        setStaff(prev => [...prev, { ...newStaff, id: generateId(), status: 'Active' }]);
    };

    const updateStaff = (id, updatedDetails) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updatedDetails } : s));
    };

    const markAttendance = (date, staffId, status) => {
        setAttendance(prev => {
            const dayData = prev[date] || {};
            return {
                ...prev,
                [date]: {
                    ...dayData,
                    [staffId]: status
                }
            };
        });
    };

    return (
        <AppContext.Provider value={{
            user,
            isAuthenticated,
            login,
            signup,
            logout,
            staff,
            attendance,
            addStaff,
            updateStaff,
            markAttendance
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
