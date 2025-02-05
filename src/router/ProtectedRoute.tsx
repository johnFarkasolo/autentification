import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
	const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); // Simulating loading state after checking auth
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
