import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const JoinTripPage = () => {
  const { tripId } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const joinTrip = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get('token');
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/trips/${tripId}/join?token=${token}`, {
          method: 'POST',
          credentials: 'include'
        });
        
        const data = await response.json();
        if (data.success) {
          setSuccess(true);
        } else {
          setError(data.message || 'Failed to join trip');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };
    
    joinTrip();
  }, [tripId]);

  if (loading) return <CircularProgress />;
  
  return (
    <div style={{ padding: '20px' }}>
      {success ? (
        <Alert severity="success">
          Successfully joined trip! You can now close this window.
        </Alert>
      ) : (
        <Alert severity="error">
          {error || 'Invalid or expired invitation link'}
        </Alert>
      )}
    </div>
  );
};

export default JoinTripPage;