import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ExternalLink, Plus, Trash2, FolderOpen, FileText, ChevronRight } from 'lucide-react';

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lessons, setLessons } = useData();
  const { isAdmin } = useAdmin();

  const subject = lessons.find(l => l.id === parseInt(id));
  const materials = subject?.materials || [];
  const subSubjects = lessons.filter(l => l.parentId === parseInt(id));

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSubName, setNewSubName] = useState('');

  if (!subject) {
    return (
      <PageTransition>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Subject Not Found</h2>
          <button onClick={() => navigate('/subjects')} className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Back to Subjects</button>
        </div>
      </PageTransition>
    );
  }

  const handleAddMaterial = () => {
    if (!newTitle || !newUrl) return;
    const newMaterial = { id: Date.now(), title: newTitle, url: newUrl };
    
    setLessons(prev => prev.map(l => 
      l.id === subject.id 
        ? { ...l, materials: [...(l.materials || []), newMaterial] } 
        : l
    ));
    
    setNewTitle('');
    setNewUrl('');
  };

  const handleAddSubSubject = () => {
    if (!newSubName) return;
    const newSub = {
      id: Date.now(),
      name: newSubName,
      link: '',
      color: subject.color,
      parentId: subject.id,
      subSubjects: [],
      materials: []
    };
    setLessons(prev => [...prev, newSub]);
    setNewSubName('');
  };

  const handleDeleteMaterial = (materialId) => {
    setLessons(prev => prev.map(l => 
      l.id === subject.id 
        ? { ...l, materials: (l.materials || []).filter(m => m.id !== materialId) } 
        : l
    ));
  };

  const handleDeleteSub = (subId) => {
    setLessons(prev => prev.filter(l => l.id !== subId));
  };

  return (
    <PageTransition>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => {
            if (subject.parentId) {
              navigate(`/subjects/${subject.parentId}`);
            } else {
              navigate('/subjects');
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, marginBottom: '1.5rem', fontSize: '0.9rem', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to {subject.parentId ? 'Parent' : 'Subjects'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}10)`,
              border: `1px solid ${subject.color}30`,
              color: subject.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FolderOpen size={32} />
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gradient"
                style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800, letterSpacing: '-1px' }}
              >
                {subject.name}
              </motion.h1>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                {subject.parentId ? 'Sub-subject folder' : 'Main subject library'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {subject.link && (
              <a 
                href={subject.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  borderRadius: 'var(--border-radius-sm)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                <ExternalLink size={18} /> Drive Folder
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Subjects Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <FolderOpen strokeWidth={2.5} color="var(--accent-primary)" /> Sub-Subjects
        </h2>

        {isAdmin && (
          <GlassCard style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="New Sub-Subject Name (e.g. Algebra 101)"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.95rem'
              }}
            />
            <button 
              onClick={handleAddSubSubject}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <Plus size={18} /> Create Sub-Subject
            </button>
          </GlassCard>
        )}

        {subSubjects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {subSubjects.map(sub => (
              <motion.div
                key={sub.id}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => navigate(`/subjects/${sub.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <GlassCard style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: subject.color }}><FolderOpen size={24} /></div>
                  <div style={{ flex: 1, fontWeight: 600 }}>{sub.name}</div>
                  <ChevronRight size={18} color="var(--text-tertiary)" />
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSub(sub.id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: '0.25rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : !isAdmin && (
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '3rem' }}>No sub-folders in this category.</p>
        )}
      </div>

      {/* Materials Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <BookOpen strokeWidth={2.5} color="var(--accent-primary)" /> Study Materials
        </h2>

        {isAdmin && (
          <GlassCard style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input 
                type="text"
                placeholder="Material Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1, minWidth: '200px', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)'
                }}
              />
              <input 
                type="url"
                placeholder="Link URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                style={{
                  flex: 2, minWidth: '250px', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)'
                }}
              />
            </div>
            <button 
              onClick={handleAddMaterial}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <Plus size={18} /> Add Material
            </button>
          </GlassCard>
        )}

        {materials.length === 0 ? (
          <GlassCard style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <BookOpen size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No direct links uploaded to this folder yet.</p>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {materials.map((material, idx) => (
              <motion.div key={material.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <GlassCard style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{material.title}</h4>
                    <a href={material.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ExternalLink size={12} /> View Material
                    </a>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteMaterial(material.id)} style={{ background: 'transparent', color: 'var(--status-danger)', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default SubjectDetails;
