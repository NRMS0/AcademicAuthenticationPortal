import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roleRequired }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Check if the user's role matches the required role
  if (roleRequired && userRole !== roleRequired) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}