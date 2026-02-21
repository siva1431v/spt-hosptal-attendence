import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAppContext();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
