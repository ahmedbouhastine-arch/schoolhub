import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { ExternalLink, Folder, Plus, Trash2, ChevronRight, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';

const Subjects = () => {
  const { lessons, setLessons } = useData();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const handleEdit = (id, field, value) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleAdd = (parentId = null) => {
    const parent = parentId ? lessons.find(l => l.id === parentId) : null;
    const newLesson = {
      id: Date.now(),
      name: parentId ? 'New Sub-Subject' : 'New Subject',
      link: parentId ? '' : 'https://drive.google.com/drive/',
      color: parent?.color || '#6366f1',
      parentId,
      subSubjects: []
    };
    setLessons([...lessons, newLesson]);
    if (parentId) {
      setExpandedSubjects(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const handleDelete = (id) => {
    // Delete the item and all its children
    const idsToDelete = [id];
    const findChildren = (parentId) => {
      lessons.filter(l => l.parentId === parentId).forEach(child => {
        idsToDelete.push(child.id);
        findChildren(child.id);
      });
    };
    findChildren(id);
    setLessons(prev => prev.filter(l => !idsToDelete.includes(l.id)));
  };

  const toggleExpand = (id) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get main subjects (no parent)
  const mainSubjects = lessons.filter(l => l.parentId === null);

  // Get sub-subjects for a parent
  const getSubSubjects = (parentId) => lessons.filter(l => l.parentId === parentId);

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
            Subjects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}
          >
            Access study materials organized by main subjects and sub-subjects.
          </motion.p>
        </div>
        {isAdmin && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdd(null)}
            className="btn-primary"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Plus size={18} /> Add Subject
          </motion.button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mainSubjects.map((subject, index) => {
          const subSubjects = getSubSubjects(subject.id);
          const isExpanded = expandedSubjects[subject.id];
          const hasSubSubjects = subSubjects.length > 0;

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GlassCard style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                {/* Color accent bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${subject.color}, transparent)`,
                  opacity: 0.8
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
                  {/* Expand/Collapse button for subjects with children */}
                  {hasSubSubjects && (
                    <button
                      onClick={() => toggleExpand(subject.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}

                  {/* Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}10)`,
                    border: `1px solid ${subject.color}30`,
                    color: subject.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${subject.color}20`
                  }}>
                    {hasSubSubjects ? <Folder size={24} /> : <FileText size={24} />}
                  </div>

                  {/* Subject Info */}
                  <div style={{ flex: 1 }}>
                    {isAdmin ? (
                      <input
                        value={subject.name}
                        onChange={(e) => handleEdit(subject.id, 'name', e.target.value)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          outline: 'none',
                          width: '100%',
                          maxWidth: '400px'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    ) : (
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {subject.name}
                      </h3>
                    )}
                    {hasSubSubjects && (
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                        {subSubjects.length} sub-subject{subSubjects.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {isAdmin && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAdd(subject.id)}
                          title="Add sub-subject"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            background: 'var(--accent-primary-light)',
                            color: 'var(--accent-primary)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: 'var(--border-radius-sm)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)'
                          }}
                        >
                          <Plus size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(subject.id)}
                          title="Delete"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            background: 'var(--status-danger-bg)',
                            color: 'var(--status-danger)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--border-radius-sm)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)'
                          }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-Subjects List */}
                {hasSubSubjects && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      borderTop: '1px solid var(--glass-border)',
                      background: 'rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {subSubjects.map((sub, subIndex) => (
                      <div
                        key={sub.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 1.5rem 1rem 3.5rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                          transition: 'background var(--transition-base)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Sub-subject Icon */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: `linear-gradient(135deg, ${sub.color}20, ${sub.color}10)`,
                          border: `1px solid ${sub.color}30`,
                          color: sub.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={20} />
                        </div>

                        {/* Sub-subject Info */}
                        <div style={{ flex: 1 }}>
                          {isAdmin ? (
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <input
                                value={sub.name}
                                onChange={(e) => handleEdit(sub.id, 'name', e.target.value)}
                                placeholder="Sub-subject name"
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: 'var(--border-radius-sm)',
                                  fontSize: '0.95rem',
                                  fontWeight: 500,
                                  outline: 'none',
                                  minWidth: '150px'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
                              />
                              <input
                                value={sub.link}
                                onChange={(e) => handleEdit(sub.id, 'link', e.target.value)}
                                placeholder="Drive URL (optional)"
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: 'var(--border-radius-sm)',
                                  fontSize: '0.875rem',
                                  outline: 'none',
                                  flex: 1,
                                  minWidth: '200px'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Color</span>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: sub.color,
                                  border: '2px solid rgba(255, 255, 255, 0.1)',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}>
                                  <input
                                    type="color"
                                    value={sub.color}
                                    onChange={(e) => handleEdit(sub.id, 'color', e.target.value)}
                                    style={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      width: '150%',
                                      height: '150%',
                                      cursor: 'pointer',
                                      border: 'none',
                                      padding: 0
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {sub.name}
                            </h4>
                          )}
                        </div>

                        {/* Open Link Button */}
                        {sub.link && !isAdmin && (
                          <a
                            href={sub.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 0.875rem',
                              background: 'var(--glass-bg)',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text-primary)',
                              borderRadius: 'var(--border-radius-sm)',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              transition: 'all var(--transition-base)'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'var(--glass-bg)'}
                          >
                            <ExternalLink size={14} /> Open
                          </a>
                        )}

                        {/* Delete Button for Admin */}
                        {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(sub.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.5rem',
                              background: 'var(--status-danger-bg)',
                              color: 'var(--status-danger)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: 'var(--border-radius-sm)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-base)'
                            }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        )}
                      </div>
                    ))}

                    {/* Add Sub-Subject Button (inline) */}
                    {isAdmin && (
                      <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(0, 0, 0, 0.1)' }}>
                        <button
                          onClick={() => handleAdd(subject.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px dashed var(--glass-border)',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--border-radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'all var(--transition-base)'
                          }}
                          onMouseEnter={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.color = 'var(--accent-primary)'; }}
                          onMouseLeave={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.color = 'var(--text-secondary)'; }}
                        >
                          <Plus size={14} /> Add sub-subject
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Main Subject Link (for subjects without sub-subjects) */}
                {!hasSubSubjects && subject.link && !isAdmin && (
                  <div style={{ padding: '0 1.5rem 1.25rem 1.5rem' }}>
                    <a
                      href={subject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        borderRadius: 'var(--border-radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                        transition: 'all var(--transition-base)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <ExternalLink size={16} strokeWidth={2.5} /> Open Drive Folder
                    </a>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}

        {mainSubjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem', textAlign: 'center' }}>
              <div style={{ padding: '1.25rem', background: 'var(--accent-primary-light)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <Folder size={40} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No subjects yet</p>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Add your first subject to get started</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Subjects;
