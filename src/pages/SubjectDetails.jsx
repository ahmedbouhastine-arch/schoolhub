import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, ExternalLink, Plus, Trash2, FolderOpen, FileText, ChevronRight, Home, GripVertical } from 'lucide-react';

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableSubFolder = ({ id, sub, currentSubject, isAdmin, handleDeleteSub, handleEditSub }) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => navigate(`/subjects/${sub.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <GlassCard style={{ 
          padding: '1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          borderLeft: `4px solid ${sub.color}`,
          position: 'relative'
        }}>
          {isAdmin && (
            <div 
              {...attributes} 
              {...listeners} 
              style={{ cursor: 'grab', color: 'var(--text-tertiary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} />
            </div>
          )}
          <div style={{ color: sub.color }}><FolderOpen size={24} /></div>
          <div style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem' }}>{sub.name}</div>
          
          {isAdmin && (
            <label 
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '4px', cursor: 'pointer' }}
            >
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: sub.color, border: '1px solid white' }} />
              <input 
                type="color" 
                value={sub.color} 
                onChange={(e) => handleEditSub(sub.id, 'color', e.target.value)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
            </label>
          )}

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
    </div>
  );
};

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lessons, setLessons } = useData();
  const { isAdmin } = useAdmin();

  const currentSubject = lessons.find(l => l.id.toString() === id.toString());
  const materials = currentSubject?.materials || [];
  const subSubjects = lessons.filter(l => l.parentId?.toString() === id.toString());

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState(currentSubject?.color || '#6366f1');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Breadcrumb generator
  const breadcrumbs = useMemo(() => {
    const path = [];
    let current = currentSubject;
    while (current) {
      path.unshift(current);
      current = lessons.find(l => l.id === current.parentId);
    }
    return path;
  }, [currentSubject, lessons]);

  if (!currentSubject) {
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
      l.id === currentSubject.id 
        ? { ...l, materials: [...(l.materials || []), newMaterial] } 
        : l
    ));
    
    setNewTitle('');
    setNewUrl('');
  };

  const handleAddSubSubject = () => {
    if (!newSubName) return;
    const newSub = {
      id: Date.now().toString(),
      name: newSubName,
      link: '',
      color: newSubColor,
      parentId: currentSubject.id,
      subSubjects: [],
      materials: []
    };
    setLessons(prev => [...prev, newSub]);
    setNewSubName('');
  };

  const handleEditSub = (id, field, value) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleDeleteMaterial = (materialId) => {
    setLessons(prev => prev.map(l => 
      l.id.toString() === currentSubject.id.toString()
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
        {/* Modern Breadcrumbs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link 
            to="/subjects" 
            style={{ color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-tertiary)'}
          >
            <Home size={16} /> Subjects
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} color="var(--text-tertiary)" />
              <Link 
                to={`/subjects/${crumb.id}`}
                style={{ 
                  color: idx === breadcrumbs.length - 1 ? 'var(--accent-primary)' : 'var(--text-tertiary)', 
                  textDecoration: 'none',
                  fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = idx === breadcrumbs.length - 1 ? 'var(--accent-primary)' : 'var(--text-tertiary)'}
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${currentSubject.color}20, ${currentSubject.color}10)`,
              border: `1px solid ${currentSubject.color}30`,
              color: currentSubject.color,
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
                {currentSubject.name}
              </motion.h1>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                Folder System: {breadcrumbs.map(b => b.name).join(' / ')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {currentSubject.link && (
              <a 
                href={currentSubject.link}
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
                <ExternalLink size={18} /> Master Drive
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Folders Section */}
      <div style={{ marginTop: '3.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <FolderOpen strokeWidth={2.5} color="var(--accent-primary)" /> Sub-Folders
        </h2>

        {isAdmin && (
          <GlassCard style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="Name for new sub-folder..."
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
            <label style={{ cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: newSubColor, border: '2px solid white' }} />
              <input type="color" value={newSubColor} onChange={(e) => setNewSubColor(e.target.value)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
            </label>
            <button 
              onClick={handleAddSubSubject}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <Plus size={18} /> Create Folder
            </button>
          </GlassCard>
        )}

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={subSubjects.map(s => s.id)}
            strategy={rectSortingStrategy}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {subSubjects.map(sub => (
                <SortableSubFolder 
                  key={sub.id}
                  id={sub.id}
                  sub={sub}
                  currentSubject={currentSubject}
                  isAdmin={isAdmin}
                  handleDeleteSub={handleDeleteSub}
                  handleEditSub={handleEditSub}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {subSubjects.length === 0 && !isAdmin && (
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '3rem' }}>No sub-folders found here.</p>
        )}
      </div>

      {/* Materials Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <BookOpen strokeWidth={2.5} color="var(--accent-primary)" /> Lessons & Materials
        </h2>

        {isAdmin && (
          <GlassCard style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input 
                type="text"
                placeholder="Lesson/Material Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1, minWidth: '200px', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)'
                }}
              />
              <input 
                type="url"
                placeholder="Drive Link or File URL"
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
              <Plus size={18} /> Add Lesson
            </button>
          </GlassCard>
        )}

        {materials.length === 0 ? (
          <GlassCard style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <FileText size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No lessons added to this folder yet.</p>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {materials.map((material, idx) => (
              <motion.div key={material.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <GlassCard style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '100%', borderBottom: `2px solid var(--accent-primary)` }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{material.title}</h4>
                    <a href={material.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ExternalLink size={12} /> View Lesson
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
