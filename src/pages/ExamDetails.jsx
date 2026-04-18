import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, BookOpen, ExternalLink, Plus, Trash2, Folder, FileText } from 'lucide-react';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, setExams, lessons } = useData();
  const { isAdmin } = useAdmin();

  const exam = exams.find(e => e.id.toString() === id.toString());
  const [selectedId, setSelectedId] = useState('');

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

  // Parse attached items
  const attachedFolders = (exam.linkedLessons || []).map(linkId => lessons.find(l => l.id.toString() === linkId.toString())).filter(Boolean);
  
  // Aggregate all materials from all lessons for easy lookup
  const allPossibleMaterials = lessons.flatMap(l => (l.materials || []).map(m => ({ ...m, subjectName: l.name, subjectColor: l.color })));
  const attachedMaterials = (exam.linkedMaterials || []).map(mId => allPossibleMaterials.find(m => m.id.toString() === mId.toString())).filter(Boolean);

  // Dropdown options: Subjects and Sub-subjects
  const mainSubjects = lessons.filter(l => l.parentId === null);

  const handleAttach = () => {
    if (!selectedId) return;
    
    // Check if it's a Material ID (they are larger usually because they are Date.now() but let's check prefix)
    const isMaterial = selectedId.startsWith('mat_');
    const realId = isMaterial ? selectedId.replace('mat_', '') : selectedId;

    if (isMaterial) {
      const currentLinks = exam.linkedMaterials || [];
      if (currentLinks.map(mid => mid.toString()).includes(realId.toString())) return;
      setExams(prev => prev.map(e => e.id.toString() === exam.id.toString() ? { ...e, linkedMaterials: [...currentLinks, realId] } : e));
    } else {
      const currentLinks = exam.linkedLessons || [];
      if (currentLinks.map(lid => lid.toString()).includes(realId.toString())) return;
      setExams(prev => prev.map(e => e.id.toString() === exam.id.toString() ? { ...e, linkedLessons: [...currentLinks, realId] } : e));
    }
    
    setSelectedId('');
  };

  const handleDetachFolder = (id) => {
    setExams(prev => prev.map(e => e.id.toString() === exam.id.toString() ? { ...e, linkedLessons: (e.linkedLessons || []).filter(lid => lid.toString() !== id.toString()) } : e));
  };

  const handleDetachMaterial = (id) => {
    setExams(prev => prev.map(e => e.id.toString() === exam.id.toString() ? { ...e, linkedMaterials: (e.linkedMaterials || []).filter(mid => mid.toString() !== id.toString()) } : e));
  };

  return (
    <PageTransition>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/exams')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to Exams
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 800 }}>
              {exam.subject}
            </motion.h1>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> {exam.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> {exam.time}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {exam.location}</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: `2px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: `0 0 30px ${color}30` }}
          >
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: color, lineHeight: 1 }}>{daysLeft}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.5rem' }}>Days Left</span>
          </motion.div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <BookOpen strokeWidth={2.5} color="var(--accent-primary)" /> Study Library
        </h2>

        {isAdmin && (
          <GlassCard style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)', fontSize: '1rem' }}
              >
                <option value="" disabled>Search Subjects or Specific Files...</option>
                <optgroup label="📂 Subject Folders">
                  {(() => {
                    const renderOptions = (parentId = null, depth = 0) => {
                      return lessons
                        .filter(l => l.parentId === parentId)
                        .map(l => (
                          <React.Fragment key={l.id}>
                            <option value={l.id}>
                              {'\u00A0'.repeat(depth * 3)}{depth > 0 ? '└─ ' : ''}{l.name}
                            </option>
                            {renderOptions(l.id, depth + 1)}
                          </React.Fragment>
                        ));
                    };
                    return renderOptions();
                  })()}
                </optgroup>
                <optgroup label="📄 Individual Materials">
                  {allPossibleMaterials.map(m => (
                    <option key={m.id} value={`mat_${m.id}`}>{m.subjectName} — {m.title}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <button onClick={handleAttach} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Plus size={18} /> Attach to Exam
            </button>
          </GlassCard>
        )}

        {(attachedFolders.length === 0 && attachedMaterials.length === 0) ? (
          <GlassCard style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No study materials linked to this exam yet.</p>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Render Folders First */}
            {attachedFolders.map(folder => (
              <motion.div key={folder.id} whileHover={{ y: -4 }}>
                <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', borderLeft: `4px solid ${folder.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: folder.color }}><Folder size={32} /></div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{folder.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Subject Folder</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button onClick={() => navigate(`/subjects/${folder.id}`)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>Open Library</button>
                    {isAdmin && <button onClick={() => handleDetachFolder(folder.id)} style={{ color: 'var(--status-danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>}
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {/* Render Individual Materials */}
            {attachedMaterials.map(mat => (
              <motion.div key={mat.id} whileHover={{ y: -4 }}>
                <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', borderLeft: `4px solid ${mat.subjectColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--accent-primary)' }}><FileText size={32} /></div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{mat.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{mat.subjectName}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <a href={mat.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 0' }}>View File</a>
                    {isAdmin && <button onClick={() => handleDetachMaterial(mat.id)} style={{ color: 'var(--status-danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>}
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
