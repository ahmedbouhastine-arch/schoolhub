import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { ExternalLink, Folder, Plus, Trash2, ChevronRight, FileText, FolderOpen, GripVertical, Settings, RefreshCw, X, ShieldCheck, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { syncDriveFolders } from '../utils/DriveSyncService';
import Skeleton from '../components/Skeleton';
import { CacheService } from '../utils/CacheService';

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

const SortableFolder = ({ id, node, lessons, handleEdit, handleDelete, isAdmin }) => {
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

  const childCount = lessons.filter(l => l.parentId?.toString() === node.id.toString()).length;

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div whileHover={{ y: -5, scale: 1.02 }}>
        <GlassCard 
          style={{ 
            height: '100%',
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.5rem',
            borderTop: `4px solid ${node.color}`,
            cursor: 'default',
            position: 'relative',
            background: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'var(--glass-bg)'
          }}
          onClick={() => navigate(`/subjects/${node.id}`)}
        >
          {isAdmin && (
            <div 
              {...attributes} 
              {...listeners}
              style={{ 
                position: 'absolute', 
                top: '0.75rem', 
                right: '0.75rem', 
                cursor: 'grab', 
                padding: '0.25rem',
                color: 'var(--text-tertiary)',
                zIndex: 10
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={18} />
            </div>
          )}

          <div style={{ color: node.color }}>
            <Folder size={48} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isAdmin ? (
                <>
                  <input
                    value={node.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleEdit(node.id, 'name', e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      outline: 'none',
                      flex: 1,
                      margin: '0.25rem 0'
                    }}
                  />
                  <label 
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: node.color, 
                      cursor: 'pointer', 
                      border: '2px solid white', 
                      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                      display: 'block',
                      flexShrink: 0
                    }}
                  >
                    <input 
                      type="color" 
                      value={node.color} 
                      onChange={(e) => handleEdit(node.id, 'color', e.target.value)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                  </label>
                </>
              ) : (
                <h3 style={{ margin: '0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>{node.name}</h3>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {childCount} Folders • {node.materials?.length || 0} Lessons
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
             <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: node.color }}>Open Library</span>
             {isAdmin && (
               <button
                 onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
                 style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: 0 }}
               >
                 <Trash2 size={16} />
               </button>
             )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

const Subjects = () => {
  const [lessons, setLessons] = useState(() => CacheService.get()?.lessons || []);
  const { isAdmin } = useAdmin();
  const [showSync, setShowSync] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gdrive_api_key') || '');
  const [rootId, setRootId] = useState(localStorage.getItem('gdrive_root_id') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from DB in background (non-blocking)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sync?key=lessons');
        const lessonsData = await res.json();

        if (lessonsData) {
          setLessons(lessonsData);
          const fullCache = CacheService.get() || {};
          CacheService.save({ ...fullCache, lessons: lessonsData });
        }
      } catch (err) {
        console.error("Failed to load lessons", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to save current state to DB
  const saveToDB = useCallback(async (updatedLessons) => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: updatedLessons })
      });
    } catch (err) {
      console.error("Failed to sync lessons", err);
    }
  }, []);

  // Debounce effect for reordering/editing
  useEffect(() => {
    if (lessons.length === 0) return;
    const timeoutId = setTimeout(() => saveToDB(lessons), 2000);
    return () => clearTimeout(timeoutId);
  }, [lessons, saveToDB]);

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

  const handleEdit = (id, field, value) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleAdd = () => {
    const newLesson = {
      id: Date.now().toString(),
      name: 'New Subject',
      link: 'https://drive.google.com/drive/',
      color: '#6366f1',
      parentId: null,
      subSubjects: [],
      materials: []
    };
    setLessons([...lessons, newLesson]);
  };

  const handleDelete = (id) => {
    const idsToDelete = [id.toString()];
    const findChildren = (pId) => {
      lessons.filter(l => l.parentId?.toString() === pId).forEach(child => {
        idsToDelete.push(child.id.toString());
        findChildren(child.id.toString());
      });
    };
    findChildren(id.toString());
    setLessons(prev => prev.filter(l => !idsToDelete.includes(l.id.toString())));
  };

  const handleSync = async () => {
    if (!apiKey || !rootId) return alert('Please enter both API Key and Root Folder ID');
    setIsSyncing(true);
    try {
      localStorage.setItem('gdrive_api_key', apiKey);
      localStorage.setItem('gdrive_root_id', rootId);
      const driveFolders = await syncDriveFolders(apiKey, rootId);

      // Merge logic: preserve existing folder properties (color, custom name) and keep offline folders
      setLessons(prev => {
        const existingMap = new Map(prev.map(l => [l.id, l]));
        const syncedIds = new Set(driveFolders.map(f => f.id));

        const updatedSynced = driveFolders.map(driveFolder => {
          const existing = existingMap.get(driveFolder.id);
          return {
            ...driveFolder,
            // Preserve existing color and name if folder already exists
            color: existing?.color || driveFolder.color,
            name: existing?.name || driveFolder.name,
            // Use synced materials from Drive
            materials: driveFolder.materials || []
          };
        });

        // Keep local-only subjects that weren't in the Drive sync
        const localOnly = prev.filter(l => !syncedIds.has(l.id));

        return [...updatedSynced, ...localOnly];
      });

      setShowSync(false);
      alert(`Sync successful! Found ${driveFolders.length} folders with lessons.`);
    } catch (err) {
      alert('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const mainSubjects = lessons.filter(l => l.parentId === null);

  // Show skeleton only on first visit (isLoading AND no data)
  const isFirstVisit = isLoading && lessons.length === 0;
  if (isFirstVisit) {
    return (
      <PageTransition>
        <div style={{ marginBottom: '2.5rem' }}>
          <Skeleton width="200px" height="3.5rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="300px" height="1.25rem" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} height="180px" variant="glass" />
          ))}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 800 }}>
            Library
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Browse your subjects. Drag to reorder.
          </motion.p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <button
               onClick={() => setShowSync(true)}
               className="btn-secondary"
               style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
             >
               <RefreshCw size={18} className={isSyncing ? 'spin' : ''} /> Sync Drive
             </button>
          )}
          {isAdmin && (
            <button
               onClick={handleAdd}
               className="btn-primary"
               style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
             >
               <Plus size={18} /> New Subject
             </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSync && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <GlassCard style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Settings size={24} color="var(--accent-primary)" /> Drive Sync Settings</h2>
                <button onClick={() => setShowSync(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Google API Key</label>
                  <input 
                    type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} 
                    placeholder="Enter your Google Drive API Key..."
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Root Folder ID</label>
                  <input 
                    type="text" value={rootId} onChange={(e) => setRootId(e.target.value)} 
                    placeholder="Ex: 1YMz-LvD1h..."
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="var(--accent-primary)" /> 
                    Make sure your Google Drive folders are set to "Anyone with the link can view" for the sync to work with an API Key.
                  </p>
                </div>
                <button 
                  onClick={handleSync} disabled={isSyncing} 
                  className="btn-primary" style={{ width: '100%', padding: '1rem' }}
                >
                  {isSyncing ? 'Syncing Tree...' : 'Start Automatic Sync'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={mainSubjects.map(s => s.id)}
          strategy={rectSortingStrategy}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {mainSubjects.map(subject => (
              <SortableFolder
                key={subject.id}
                id={subject.id}
                node={subject}
                lessons={lessons}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {mainSubjects.length === 0 && (
        <GlassCard style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <FolderOpen size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Library is currently empty.</p>
        </GlassCard>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2s linear infinite; }
      `}</style>
    </PageTransition>
  );
};

export default Subjects;
