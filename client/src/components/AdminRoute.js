import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const AdminRoute = ({ allowedRoles = [], children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner animation="border" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Überprüfen, ob allowedRoles ein Array ist und der Benutzer eine der erlaubten Rollen hat
  if (!Array.isArray(allowedRoles) || !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default AdminRoute;
