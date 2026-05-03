import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { Calendar, MapPin, Clock, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import { CacheService } from '../utils/CacheService';

const Exams = () => {
  const [exams, setExams] = useState(() => CacheService.get()?.exams || []);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  // Fetch from DB in background (non-blocking)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sync?key=exams');
        const examsData = await res.json();

        if (examsData) {
          setExams(examsData);
          const fullCache = CacheService.get() || {};
          CacheService.save({ ...fullCache, exams: examsData });
        }
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced save to DB
  useEffect(() => {
    if (isLoading) return;

    const saveToDB = async () => {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exams })
        });
      } catch (err) {
        console.error("Failed to sync exams", err);
      }
    };

    const timeoutId = setTimeout(saveToDB, 2000);
    return () => clearTimeout(timeoutId);
  }, [exams, isLoading]);

  const handleEdit = (id, field, value) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAdd = () => {
    const newExam = { id: Date.now(), subject: 'New Exam', date: '2026-10-01', time: '09:00', location: 'TBD', linkedLessons: [], isTBD: false };
    setExams([...exams, newExam]);
  };

  const calculateDaysLeft = (dateStr) => {
    if (!dateStr) return 0;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Format to "Oct 24, 2026" safely
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    // Account for potential timezone shifts making it display wrong day by slicing
    try {
      const [y, m, day] = dateStr.split('-');
      const parseD = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
      return parseD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    if (!h || !m) return timeStr;
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleDelete = (id) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const getDaysLeftColor = (days, isTBD) => {
    if (isTBD) return 'var(--accent-primary)';
    if (days <= 3) return 'var(--status-danger)';
    if (days <= 7) return 'var(--status-warning)';
    return 'var(--status-info)';
  };

  const sortedExams = React.useMemo(() => {
    return [...exams].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  }, [exams]);

  if (isLoading) {
    return (
      <PageTransition>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Skeleton width="350px" height="3.5rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="250px" height="1.25rem" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="120px" variant="glass" />
          ))}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-gradient"
            style={{ fontSize: 'var(--text-4xl)', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-1px' }}
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
        {sortedExams.map((exam, index) => (
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
                <div
                  style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
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
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                      <input
                        type="checkbox"
                        id={`tbd-${exam.id}`}
                        checked={exam.isTBD || false}
                        onChange={(e) => handleEdit(exam.id, 'isTBD', e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                      />
                      <label htmlFor={`tbd-${exam.id}`} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                        Date TBD
                      </label>
                    </div>
                    <input
                      type="date"
                      value={exam.date}
                      onChange={(e) => handleEdit(exam.id, 'date', e.target.value)}
                      style={{ flex: 1, minWidth: '130px', padding: '0.625rem 0.875rem', background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}
                    />
                    {!exam.isTBD && (
                      <input
                        type="time"
                        value={exam.time}
                        onChange={(e) => handleEdit(exam.id, 'time', e.target.value)}
                        style={{ flex: 1, minWidth: '100px', padding: '0.625rem 0.875rem', background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}
                      />
                    )}
                    <input
                      value={exam.location}
                      onChange={(e) => handleEdit(exam.id, 'location', e.target.value)}
                      placeholder="Location"
                      style={{ flex: 1, minWidth: '120px', padding: '0.625rem 0.875rem', background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}
                    />
                  </div>
                  {/* Admin Management Link */}
                  <button
                    onClick={() => navigate(`/exams/${exam.id}`)}
                    style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: 'var(--accent-primary-light)',
                      color: 'var(--accent-primary)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      alignSelf: 'flex-start',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-primary-light)'}
                  >
                    Manage Study Materials
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => navigate(`/exams/${exam.id}`)}
                  style={{ flex: 1, minWidth: '280px', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>{exam.subject}</h3>
                    {calculateDaysLeft(exam.date) <= 3 && (
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
                      <Calendar size={16} strokeWidth={2} /> {exam.isTBD ? `Week of ${formatDate(exam.date)}` : formatDate(exam.date)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} strokeWidth={2} /> {exam.isTBD ? 'Time TBD' : formatTime(exam.time)}
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
                border: `2px solid ${getDaysLeftColor(calculateDaysLeft(exam.date), exam.isTBD)}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <span style={{
                  fontSize: exam.isTBD ? '1.5rem' : '2rem',
                  fontWeight: 800,
                  color: getDaysLeftColor(calculateDaysLeft(exam.date), exam.isTBD),
                  lineHeight: 1,
                  textShadow: `0 0 20px ${getDaysLeftColor(calculateDaysLeft(exam.date), exam.isTBD)}40`
                }}>
                  {exam.isTBD ? 'TBD' : calculateDaysLeft(exam.date)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginTop: '0.25rem' }}>
                  {exam.isTBD ? 'Tentative' : 'Days Left'}
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
