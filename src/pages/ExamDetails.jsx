import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, BookOpen, ExternalLink, Plus, Trash2, Folder } from 'lucide-react';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, setExams, lessons } = useData();
  const { isAdmin } = useAdmin();

  const exam = exams.find(e => e.id === parseInt(id));
  const [selectedLessonId, setSelectedLessonId] = useState('');

  if (!exam) {
    return (
      <PageTransition>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Exam Not Found</h2>
          <button onClick={() => navigate('/exams')} className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Back to Exams</button>
        </div>
      </PageTransition>
    );
  }

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

  const getDaysLeftColor = (days) => {
    if (days <= 3) return 'var(--status-danger)';
    if (days <= 7) return 'var(--status-warning)';
    return 'var(--status-info)';
  };

  const daysLeft = calculateDaysLeft(exam.date);
  const color = getDaysLeftColor(daysLeft);

  const attachedLessons = (exam.linkedLessons || []).map(linkId => lessons.find(l => l.id === parseInt(linkId))).filter(Boolean);

  const handleAttach = () => {
    if (!selectedLessonId) return;
    const currentLinks = exam.linkedLessons || [];
    if (currentLinks.includes(selectedLessonId)) return;

    setExams(prev => prev.map(e => e.id === exam.id ? { ...e, linkedLessons: [...currentLinks, selectedLessonId] } : e));
    setSelectedLessonId('');
  };

  const handleDetach = (lessonIdToRemove) => {
    const currentLinks = exam.linkedLessons || [];
    setExams(prev => prev.map(e => e.id === exam.id ? { ...e, linkedLessons: currentLinks.filter(id => id !== lessonIdToRemove.toString()) } : e));
  };

  return (
    <PageTransition>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/exams')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, marginBottom: '1.5rem', fontSize: '0.9rem', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to Exams
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gradient"
              style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-1px' }}
            >
              {exam.subject}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> {exam.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> {exam.time}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {exam.location}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '1.5rem 2rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '24px',
              border: `2px solid ${color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: `0 0 30px ${color}30`
            }}
          >
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: color, lineHeight: 1, textShadow: `0 0 20px ${color}40` }}>
              {daysLeft}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', marginTop: '0.5rem' }}>
              Days Remaining
            </span>
          </motion.div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <BookOpen strokeWidth={2.5} color="var(--accent-primary)" /> Study Materials
        </h2>

        {isAdmin && (
          <GlassCard style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: 'white',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '1rem'
                }}
              >
                <option value="" disabled>Select a subject folder to attach...</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAttach}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <Plus size={18} /> Attach Folder
            </button>
          </GlassCard>
        )}

        {attachedLessons.length === 0 ? (
          <GlassCard style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>No study materials have been attached to this exam yet.</p>
            {isAdmin && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Use the dropdown above to add subject folders.</p>}
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {attachedLessons.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${lesson.color}20, ${lesson.color}10)`,
                      border: `1px solid ${lesson.color}30`,
                      color: lesson.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Folder size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{lesson.name}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Subject Folder</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                    <a
                      href={lesson.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.75rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'var(--glass-bg)'}
                    >
                      <ExternalLink size={16} /> Open Drive Folder
                    </a>

                    {isAdmin && (
                      <button
                        onClick={() => handleDetach(lesson.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '0.75rem',
                          background: 'var(--status-danger-bg)',
                          color: 'var(--status-danger)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: 'var(--border-radius-sm)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--status-danger-bg)'}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ExamDetails;
