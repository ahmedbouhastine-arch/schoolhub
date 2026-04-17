import React from 'react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { ExternalLink, Folder, Plus, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';

const Lessons = () => {
  const { lessons, setLessons } = useData();
  const { isAdmin } = useAdmin();

  const handleEdit = (id, field, value) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleAdd = () => {
    const newLesson = { id: Date.now(), name: 'New Subject Folder', link: 'https://drive.google.com/drive/', color: '#6366f1' };
    setLessons([...lessons, newLesson]);
  };

  const handleDelete = (id) => {
    setLessons(prev => prev.filter(l => l.id !== id));
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
            Course Materials
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}
          >
            Access your lesson notes and resources via Google Drive.
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
            <Plus size={18} /> Add Folder
          </motion.button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {lessons.map((folder, index) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <GlassCard style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', height: '100%', position: 'relative' }}>
              {/* Background gradient accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${folder.color}, transparent)`,
                opacity: 0.8
              }} />

              <div style={{
                padding: '2.5rem 2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)`,
                position: 'relative'
              }}>
                {/* Glow effect behind icon */}
                <div style={{
                  position: 'absolute',
                  width: '80px',
                  height: '80px',
                  background: folder.color,
                  borderRadius: '50%',
                  opacity: 0.15,
                  filter: 'blur(20px)'
                }} />

                <Folder
                  size={72}
                  color={folder.color}
                  strokeWidth={1.5}
                  style={{
                    filter: `drop-shadow(0 4px 16px ${folder.color}40)`,
                    position: 'relative',
                    zIndex: 1
                  }}
                />

                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(folder.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'var(--status-danger-bg)',
                      color: 'var(--status-danger)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-base)',
                      zIndex: 2
                    }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
              </div>

              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {isAdmin ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', flex: 1 }}>
                    <input
                      value={folder.name}
                      onChange={e => handleEdit(folder.id, 'name', e.target.value)}
                      placeholder="Folder Name"
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        outline: 'none',
                        transition: 'all var(--transition-base)'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <input
                      value={folder.link}
                      onChange={e => handleEdit(folder.id, 'link', e.target.value)}
                      placeholder="Drive URL"
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all var(--transition-base)'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</span>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: folder.color,
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <input
                          type="color"
                          value={folder.color}
                          onChange={e => handleEdit(folder.id, 'color', e.target.value)}
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
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{folder.color}</span>
                    </div>
                  </div>
                ) : (
                  <h3 style={{
                    margin: '0 0 1.25rem 0',
                    fontSize: '1.05rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    flex: 1
                  }}>
                    {folder.name}
                  </h3>
                )}

                <motion.a
                  href={folder.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1rem',
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
                >
                  <ExternalLink size={16} strokeWidth={2.5} />
                  Open in Drive
                </motion.a>
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {lessons.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ gridColumn: '1 / -1' }}
          >
            <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem', textAlign: 'center' }}>
              <div style={{ padding: '1.25rem', background: 'var(--accent-primary-light)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <Folder size={40} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No folders yet</p>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Add your first course folder to get started</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Lessons;
