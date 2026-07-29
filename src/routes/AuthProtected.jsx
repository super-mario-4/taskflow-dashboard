import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { useSelector } from 'react-redux';

const AuthProtected = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default AuthProtected;
