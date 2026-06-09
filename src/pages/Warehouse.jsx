import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BASE_URL } from '../services/api';

export default function Warehouse() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentToken = localStorage.getItem('token') || localStorage.getItem('warehouseToken');
    setToken(currentToken);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  const backendHtmlUrl = `${BASE_URL}/warehouse?auth_token=${token}`;

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <iframe
        src={backendHtmlUrl}
        className="w-full h-full border-none absolute top-0 left-0"
        title="Anritvox Warehouse POS System"
        allow="camera; microphone; fullscreen"
      />
    </div>
  );
}
