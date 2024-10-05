import React from 'react';
import { Navigate } from 'react-router-dom';

// Check if the user is authenticated
const isAuthenticated = () => {
    const token = sessionStorage.getItem('token');
    return token ? true : false;
};

// ProtectedRoute component
function ProtectedRoute({ element }) {
    return isAuthenticated() ? element : <Navigate to="/login" />;
}

export default ProtectedRoute;
