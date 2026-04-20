import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { Lock, LogOut } from 'lucide-react';

const AdminAuth = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { isAdmin, login, logout } = useAdmin();
  const navigate = useNavigate();

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      setError(false);
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = (e) => {
    if(e) e.preventDefault();
    if (login(pin)) {
      navigate('/teachers');
    } else {
      setError(true);
      setPin('');
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  if (isAdmin) {
    return (
      <PageTransition>
        <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
          <GlassCard style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}>
            <div style={{ padding: '1rem', background: 'var(--status-success-bg)', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
              <LogOut size={32} color="var(--status-success)" />
            </div>
            <h2 style={{ marginBottom: '1rem' }}>You are logged in</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You have access to modify statuses.</p>
            <button
              onClick={async () => {
                const { migrateData } = await import('../utils/migrateData');
                const success = await migrateData();
                alert(success ? '✅ Migration complete! Data saved to database.' : '❌ Migration failed. Check console.');
              }}
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                width: '100%',
                marginBottom: '1rem'
              }}
            >
              Migrate Local Data to DB
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                background: 'var(--status-danger)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Sign Out
            </button>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <GlassCard style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px', width: '100%' }}>
          <div style={{ padding: '1rem', background: 'var(--accent-glow)', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
            <Lock size={32} color="var(--accent-primary)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enter 4-digit PIN to gain access.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index}
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: index < pin.length ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                  boxShadow: index < pin.length ? '0 0 10px var(--accent-glow)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          {error && <p style={{ color: 'var(--status-danger)', marginBottom: '1rem', fontWeight: 'bold' }}>Incorrect PIN. Try again.</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button 
                key={num} 
                onClick={() => handleKeyPress(num.toString())}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                className="pin-pad-btn"
              >
                {num}
              </button>
            ))}
            <div />
            <button 
              onClick={() => handleKeyPress('0')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                padding: '1rem',
                fontSize: '1.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="pin-pad-btn"
            >
              0
            </button>
            <button 
              onClick={handleDelete}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                padding: '1rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="pin-pad-btn"
            >
              DEL
            </button>
          </div>
        </GlassCard>
      </div>
      <style>{`
        .pin-pad-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .pin-pad-btn:active { transform: scale(0.95); }
      `}</style>
    </PageTransition>
  );
};

export default AdminAuth;
