import React, { useState, useEffect } from 'react';
import './MainPage.css';
import '../common.css';
import * as api from '../api.js';

export default function MainPage({ user }) {
  const [ping, setPing] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPing = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const ping = await api.ping(token);
      setPing(ping);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPing();
  }, []);

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {ping && <p>{ping}</p>}
    </>
  );
};
