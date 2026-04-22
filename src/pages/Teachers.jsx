import React, { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { MessageSquare, Send, Edit2, Plus, Trash2, User, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import { CacheService } from '../utils/CacheService';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAdmin();

  // Fetch from DB on mount
  useEffect(() => {
    // 1. Try to load from cache first for instant UI
    const cached = CacheService.get();
    if (cached && cached.teachers) {
      setTeachers(cached.teachers);
      setIsLoading(false);
    }

    // 2. Always fetch latest from DB in background
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sync?key=teachers');
        const teachersData = await res.json();
        
        if (teachersData) {
          setTeachers(teachersData);
          const fullCache = CacheService.get() || {};
          CacheService.save({ ...fullCache, teachers: teachersData });
        }
      } catch (err) {
        console.error("Failed to load teachers", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to save current state to DB
  const saveToDB = async (updatedTeachers) => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachers: updatedTeachers })
      });
    } catch (err) {
      console.error("Failed to save teachers", err);
    }
  };

  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleAdminSave = async (id) => {
    const updated = teachers.map(t =>
      t.id === id ? { ...t, name: editName, subject: editSubject, status: editStatus, adminNote: editNote } : t
    );
    setTeachers(updated);
    setEditingId(null);
    await saveToDB(updated);
  };

  const handleAdd = async () => {
    const newTeacher = { id: Date.now(), name: 'New Teacher', subject: 'Subject', status: 'Present', adminNote: '' };
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    await saveToDB(updated);
  };

  const handleDelete = async (id) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    await saveToDB(updated);
  };

  const startEdit = (teacher) => {
    setEditingId(teacher.id);
    setEditName(teacher.name);
    setEditSubject(teacher.subject);
    setEditStatus(teacher.status);
    setEditNote(teacher.adminNote);
  };

  const handleAddComment = (id) => {
    if (!newComment.trim()) return;
    setComments(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), newComment]
    }));
    setNewComment('');
  };

  const getStatusColor = (status) => {
    if (status === 'Present') return 'var(--status-success)';
    if (status === 'Absent') return 'var(--status-danger)';
    return 'var(--status-warning)';
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Skeleton width="300px" height="3.5rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="200px" height="1.25rem" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} height="200px" variant="glass" />
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
            Teacher Directory
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}
          >
            Check attendance status and leave comments.
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
            <Plus size={18} /> Add Teacher
          </motion.button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {teachers.map((teacher, index) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <GlassCard style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${getStatusColor(teacher.status)}20, ${getStatusColor(teacher.status)}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${getStatusColor(teacher.status)}30`,
                    boxShadow: `0 4px 16px ${getStatusColor(teacher.status)}20`
                  }}>
                    <User size={28} color={getStatusColor(teacher.status)} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{teacher.name}</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{teacher.subject}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={teacher.status} text={teacher.status} />
                  {isAdmin && editingId !== teacher.id && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEdit(teacher)}
                        style={{ color: 'var(--accent-primary)', padding: '0.5rem', background: 'var(--accent-primary-light)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all var(--transition-base)' }}
                      >
                        <Edit2 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(teacher.id)}
                        style={{ color: 'var(--status-danger)', padding: '0.5rem', background: 'var(--status-danger-bg)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all var(--transition-base)' }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {editingId === teacher.id ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.25rem', borderRadius: 'var(--border-radius)', marginBottom: '1rem' }}
                >
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Teacher Name"
                    style={{ width: '100%', marginBottom: '0.75rem', background: 'rgba(0, 0, 0, 0.4)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.95rem', outline: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; }}
                  />
                  <input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="Subject"
                    style={{ width: '100%', marginBottom: '0.75rem', background: 'rgba(0, 0, 0, 0.4)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.95rem', outline: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; }}
                  />
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', marginBottom: '0.75rem', background: 'rgba(0, 0, 0, 0.4)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Substitute">Substitute</option>
                  </select>
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Admin Note..."
                    style={{ width: '100%', minHeight: '70px', background: 'rgba(0, 0, 0, 0.4)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.95rem', resize: 'vertical', marginBottom: '1rem', outline: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontWeight: 500, transition: 'all var(--transition-base)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAdminSave(teacher.id)}
                      style={{ padding: '0.625rem 1.25rem', background: 'var(--accent-gradient)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              ) : (
                teacher.adminNote && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      padding: '1rem',
                      background: 'rgba(99, 102, 241, 0.08)',
                      borderLeft: '3px solid var(--accent-primary)',
                      borderRadius: 'var(--border-radius-sm)',
                      marginBottom: '1rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)', display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Note</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{teacher.adminNote}</span>
                  </motion.div>
                )
              )}

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCommentId(activeCommentId === teacher.id ? null : teacher.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all var(--transition-base)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--glass-bg)';
                    e.target.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  <MessageSquare size={18} />
                  <span>{(comments[teacher.id] || []).length} Comment{(comments[teacher.id] || []).length !== 1 ? 's' : ''}</span>
                </motion.button>

                {activeCommentId === teacher.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: '1rem' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {(comments[teacher.id] || []).length > 0 ? comments[teacher.id].map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem', border: '1px solid rgba(255, 255, 255, 0.03)' }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Student</span>
                          {c}
                        </motion.div>
                      )) : (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                          No comments yet. Be the first to add one!
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(teacher.id)}
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.625rem 0.875rem',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          transition: 'all var(--transition-base)'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddComment(teacher.id)}
                        style={{
                          background: 'var(--accent-gradient)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.625rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                          transition: 'all var(--transition-base)'
                        }}
                      >
                        <Send size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {teachers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ gridColumn: '1 / -1' }}
          >
            <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem', textAlign: 'center' }}>
              <div style={{ padding: '1.25rem', background: 'var(--accent-primary-light)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <User size={40} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No teachers yet</p>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Add your first teacher to get started</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Teachers;
