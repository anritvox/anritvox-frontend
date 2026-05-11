import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BASE_URL } from '../../services/api';

export default function WarehouseAdmin() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Grab the Master Admin token
    const currentToken = localStorage.getItem('warehouseToken') || localStorage.getItem('ms_token') || localStorage.getItem('token');
    setToken(currentToken);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Kick back to login if no token is found
  if (!token) {
    return <Navigate to="/warehouseadmin" />;
  }

  // Load the backend HTML file, passing the auth token securely via URL
  const backendHtmlUrl = `${BASE_URL}/warehouseadmin?auth_token=${token}`;

  return (
    <div className="w-full h-screen bg-[#020617] overflow-hidden relative">
      <iframe
        src={backendHtmlUrl}
        className="w-full h-full border-none absolute top-0 left-0"
        title="Anritvox Master Warehouse Admin"
        allow="camera; microphone; fullscreen"
      />
    </div>
  );
}
