import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Skeleton from '../components/Skeleton';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAdmin();

  // Fetch from DB on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sync');
        const data = await res.json();
        if (data.schedule) setSchedule(data.schedule);
      } catch (err) {
        console.error("Failed to load schedule", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced save to DB
  useEffect(() => {
    if (isLoading || schedule.length === 0) return;
    
    const saveToDB = async () => {
      try {
        const res = await fetch('/api/sync');
        const allData = await res.json();
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...allData, schedule })
        });
      } catch (err) {
        console.error("Failed to sync schedule", err);
      }
    };

    const timeoutId = setTimeout(saveToDB, 2000);
    return () => clearTimeout(timeoutId);
  }, [schedule, isLoading]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentDayIndex = currentTime.getDay();
  const isCurrentDay = (day) => {
    const daysMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    return daysMap[day] === currentDayIndex;
  };

  const isCurrentTime = (timeStr) => {
    if (!timeStr) return false;
    const [start, end] = timeStr.split(' - ');
    if (!start || !end) return false;

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();

    const currentMins = nowH * 60 + nowM;
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    return currentMins >= startMins && currentMins < endMins;
  };

  const handleEdit = (id, field, value) => {
    setSchedule(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const renderCell = (row, field) => {
    if (isAdmin) {
      if (field === 'time') return row[field];
      return (
        <input
          type="text"
          value={row[field]}
          onChange={(e) => handleEdit(row.id, field, e.target.value)}
          placeholder="Empty"
          style={{
            width: '100%',
            padding: '0.625rem 0.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all var(--transition-base)',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--glass-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      );
    }
    return row[field] || (
      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>—</span>
    );
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (isLoading) {
    return (
      <PageTransition>
        <div style={{ marginBottom: '2rem' }}>
          <Skeleton width="350px" height="3.5rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="250px" height="1.25rem" />
        </div>
        <Skeleton height="500px" variant="glass" />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ marginBottom: '2rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-gradient"
          style={{ fontSize: '2.75rem', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-1px' }}
        >
          Class Schedule
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}
        >
          Your weekly timetable at a glance.
        </motion.p>
        {isAdmin && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              padding: '0.5rem 0.875rem',
              background: 'var(--accent-primary-light)',
              color: 'var(--accent-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}
          >
            <span style={{ width: 8, height: 8, background: 'var(--accent-primary)', borderRadius: '50%' }} />
            Admin Mode: Click any cell to edit
          </motion.span>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{
                  padding: '1.25rem 1rem',
                  borderBottom: '2px solid var(--glass-border)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: '120px'
                }}>
                  Time
                </th>
                {days.map((day, index) => {
                  const activeDay = isCurrentDay(day);
                  return (
                  <th
                    key={day}
                    style={{
                      padding: '1.25rem 1rem',
                      borderBottom: activeDay ? '2px solid var(--accent-primary)' : '2px solid var(--glass-border)',
                      background: activeDay ? 'rgba(99, 102, 241, 0.15)' : (index === 5 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.3)'),
                      color: activeDay ? 'var(--text-primary)' : (index === 5 ? 'var(--accent-secondary)' : 'var(--accent-primary)'),
                      fontSize: '0.75rem',
                      fontWeight: activeDay ? 800 : 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      minWidth: '140px',
                      position: 'relative'
                    }}
                  >
                    {dayNames[index]}
                    {(index === 5 || activeDay) && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '50%',
                        transform: 'translateX(50%)',
                        width: '4px',
                        height: '4px',
                        background: activeDay ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                        borderRadius: '50%',
                        boxShadow: `0 0 8px ${activeDay ? 'var(--accent-primary)' : 'var(--accent-secondary)'}`
                      }} />
                    )}
                  </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {schedule.map((slot, index) => (
                <motion.tr
                  key={slot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{
                    transition: 'background var(--transition-base)'
                  }}
                >
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    background: 'rgba(0, 0, 0, 0.15)',
                    minWidth: '120px'
                  }}>
                    {slot.time}
                  </td>
                  {days.map((day) => {
                    const isActive = isCurrentDay(day) && isCurrentTime(slot.time) && slot[day];
                    return (
                    <td
                      key={`${slot.id}-${day}`}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isActive 
                            ? 'rgba(99, 102, 241, 0.25)' 
                            : slot[day]
                                ? index === 5
                                    ? 'rgba(139, 92, 246, 0.08)'
                                    : 'rgba(99, 102, 241, 0.08)'
                                : 'transparent',
                        transition: 'background var(--transition-base)',
                        fontSize: '0.9rem',
                        fontWeight: slot[day] ? (isActive ? 700 : 500) : 400,
                        color: slot[day] ? (isActive ? 'var(--accent-primary)' : 'var(--text-primary)') : 'var(--text-muted)',
                        boxShadow: isActive ? 'inset 0 0 0 1px var(--accent-primary)' : 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!slot[day] && !isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!slot[day] && !isActive) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {isActive && (
                        <motion.span
                            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                boxShadow: '0 0 8px var(--accent-primary)'
                            }}
                        />
                      )}
                      {renderCell(slot, day)}
                    </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </motion.div>
    </PageTransition>
  );
};

export default Schedule;
