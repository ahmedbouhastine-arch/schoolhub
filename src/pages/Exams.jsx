import React from 'react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { Calendar, MapPin, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';

const Exams = () => {
  const { exams, setExams } = useData();
  const { isAdmin } = useAdmin();

  const handleEdit = (id, field, value) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAdd = () => {
    const newExam = { id: Date.now(), subject: 'New Exam', date: 'Oct 01, 2026', time: '09:00 AM', location: 'TBD', daysLeft: 10 };
    setExams([...exams, newExam]);
  };

  const handleDelete = (id) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const getDaysLeftColor = (days) => {
    if (days <= 3) return 'var(--status-danger)';
    if (days <= 7) return 'var(--status-warning)';
    return 'var(--status-info)';
  };

  return (
    <PageTransition>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-gradient"
            style={{ fontSize: '2.75rem', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-1px' }}
          >
            Upcoming Exams
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}
          >
            Track your test dates and prepare ahead.
          </motion.p>
        </div>
        {isAdmin && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="btn-primary"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Plus size={18} /> Add Exam
          </motion.button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {exams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <GlassCard style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: '1.25rem 1.5rem',
              position: 'relative'
            }}>
              {isAdmin ? (
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    value={exam.subject}
                    onChange={(e) => handleEdit(exam.id, 'subject', e.target.value)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '1rem',
                      fontWeight: 600,
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
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input
                      value={exam.date}
                      onChange={(e) => handleEdit(exam.id, 'date', e.target.value)}
                      placeholder="Date"
                      style={{ flex: 1, minWidth: '120px', padding: '0.625rem 0.875rem', background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}
                    />
                    <input
                      value={exam.time}
                      onChange={(e) => handleEdit(exam.id, 'time', e.target.value)}
                      placeholder="Time"
                      style={{ flex: 1, minWidth: '100px', padding: '0.625rem 0.875rem', background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}
                    />
                    <input
                      value={exam.location}
                      onChange={(e) => handleEdit(exam.id, 'location', e.target.value)}
                      placeholder="Location"
                      style={{ flex: 1, minWidth: '120px', padding: '0.625rem 0.875rem', background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}
                    />
                    <input
                      value={exam.daysLeft}
                      type="number"
                      onChange={(e) => handleEdit(exam.id, 'daysLeft', parseInt(e.target.value))}
                      placeholder="Days"
                      style={{ width: '80px', padding: '0.625rem 0.875rem', background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem', textAlign: 'center' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>{exam.subject}</h3>
                    {exam.daysLeft <= 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <StatusBadge status="upcoming" text="Priority" />
                      </motion.div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} strokeWidth={2} /> {exam.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} strokeWidth={2} /> {exam.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} strokeWidth={2} /> {exam.location}
                    </span>
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px',
                padding: '1rem 1.25rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 'var(--border-radius)',
                border: `2px solid ${getDaysLeftColor(exam.daysLeft)}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: getDaysLeftColor(exam.daysLeft),
                  lineHeight: 1,
                  textShadow: `0 0 20px ${getDaysLeftColor(exam.daysLeft)}40`
                }}>
                  {exam.daysLeft}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginTop: '0.25rem' }}>
                  Days Left
                </span>
              </div>

              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(exam.id)}
                  style={{
                    background: 'var(--status-danger-bg)',
                    color: 'var(--status-danger)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '0.625rem',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  <Trash2 size={18} />
                </motion.button>
              )}
            </GlassCard>
          </motion.div>
        ))}

        {exams.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', justifyContent: 'center' }}>
              <div style={{ padding: '1rem', background: 'var(--status-info-bg)', borderRadius: '50%', color: 'var(--status-info)' }}>
                <AlertCircle size={32} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No exams scheduled</p>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enjoy your free time!</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Exams;
