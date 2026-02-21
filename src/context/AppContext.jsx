import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
    // ─── Supabase Auth State ─────────────────────────────────────────────────
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // true while session is being checked

    useEffect(() => {
        // Get current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const isAuthenticated = !!user;

    // Real Supabase login
    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error; // Let the Login page handle the error message
        return true;
    };

    // Real Supabase signup
    const signup = async (name, email, password) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });
        if (error) throw error;
        return true;
    };

    // Real Supabase logout
    const logout = async () => {
        await supabase.auth.signOut();
    };

    // ─── Staff State (Supabase) ───────────────────────────────────────────────
    const [staff, setStaff] = useState([]);
    const [staffLoading, setStaffLoading] = useState(true);

    // Load staff when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            fetchStaff();
        } else {
            setStaff([]);
        }
    }, [isAuthenticated]);

    const fetchStaff = async () => {
        setStaffLoading(true);
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching staff:', error.message);
        } else {
            setStaff(data.map(s => ({
                id: s.id,
                name: s.name,
                role: s.role,
                baseSalary: s.base_salary,
                status: s.status
            })));
        }
        setStaffLoading(false);
    };

    const addStaff = async (newStaff) => {
        const { data, error } = await supabase
            .from('staff')
            .insert([{
                name: newStaff.name,
                role: newStaff.role,
                base_salary: newStaff.baseSalary || 0,
                status: 'Active'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding staff:', error.message);
            return;
        }
        setStaff(prev => [...prev, {
            id: data.id,
            name: data.name,
            role: data.role,
            baseSalary: data.base_salary,
            status: data.status
        }]);
    };

    const updateStaff = async (id, updatedDetails) => {
        const dbUpdate = {};
        if (updatedDetails.name !== undefined) dbUpdate.name = updatedDetails.name;
        if (updatedDetails.role !== undefined) dbUpdate.role = updatedDetails.role;
        if (updatedDetails.baseSalary !== undefined) dbUpdate.base_salary = updatedDetails.baseSalary;
        if (updatedDetails.status !== undefined) dbUpdate.status = updatedDetails.status;

        const { error } = await supabase
            .from('staff')
            .update(dbUpdate)
            .eq('id', id);

        if (error) {
            console.error('Error updating staff:', error.message);
            return;
        }
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updatedDetails } : s));
    };

    // ─── Attendance State (local) ─────────────────────────────────────────────
    const [attendance, setAttendance] = useState({});

    const markAttendance = (date, staffId, status) => {
        setAttendance(prev => {
            const dayData = prev[date] || {};
            return { ...prev, [date]: { ...dayData, [staffId]: status } };
        });
    };

    // Show a loading screen while Supabase checks the session
    if (authLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', backgroundColor: 'hsl(210, 20%, 98%)',
                flexDirection: 'column', gap: '1rem'
            }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: '3px solid hsl(210, 90%, 88%)',
                    borderTopColor: 'hsl(210, 90%, 55%)',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ color: 'hsl(210, 15%, 45%)', fontSize: '0.9rem' }}>Loading SPT Hospital...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{
            user,
            isAuthenticated,
            authLoading,
            login,
            signup,
            logout,
            staff,
            staffLoading,
            attendance,
            addStaff,
            updateStaff,
            markAttendance,
            fetchStaff
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
