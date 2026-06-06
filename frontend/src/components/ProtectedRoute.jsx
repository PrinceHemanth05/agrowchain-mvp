import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { userRole } = useWeb3();

  // If the user's role is not in the list of allowed roles, kick them to the home page
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // If they are allowed, render the page!
  return children;
}