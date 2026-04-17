import React from 'react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';

const Schedule = () => {
  const { schedule, setSchedule } = useData();
  const { isAdmin } = useAdmin();

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
                {days.map((day, index) => (
                  <th
                    key={day}
                    style={{
                      padding: '1.25rem 1rem',
                      borderBottom: '2px solid var(--glass-border)',
                      background: index === 5 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                      color: index === 5 ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      minWidth: '140px',
                      position: 'relative'
                    }}
                  >
                    {dayNames[index]}
                    {index === 5 && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '50%',
                        transform: 'translateX(50%)',
                        width: '4px',
                        height: '4px',
                        background: 'var(--accent-secondary)',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px var(--accent-secondary)'
                      }} />
                    )}
                  </th>
                ))}
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
                  {days.map((day) => (
                    <td
                      key={`${slot.id}-${day}`}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: slot[day]
                          ? index === 5
                            ? 'rgba(139, 92, 246, 0.08)'
                            : 'rgba(99, 102, 241, 0.08)'
                          : 'transparent',
                        transition: 'background var(--transition-base)',
                        fontSize: '0.9rem',
                        fontWeight: slot[day] ? 500 : 400,
                        color: slot[day] ? 'var(--text-primary)' : 'var(--text-muted)'
                      }}
                      onMouseEnter={(e) => {
                        if (!slot[day]) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!slot[day]) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {renderCell(slot, day)}
                    </td>
                  ))}
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
