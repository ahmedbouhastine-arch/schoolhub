import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import { Loader2, HelpCircle, Info, CheckCircle2 } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { CacheService } from '../utils/CacheService';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAdmin();
  const [userGroup, setUserGroup] = useState(() => {
    const saved = localStorage.getItem('userGroup');
    return (saved === '1' || saved === '2') ? saved : '1';
  });
  const [showHelp, setShowHelp] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { id, field, value }
  
  const getWeekType = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo % 2 === 0 ? 'B' : 'A'; // Odd weeks are A, Even are B
  };

  const [viewWeek, setViewWeek] = useState(() => getWeekType(new Date()));
  const currentRealWeek = getWeekType(new Date());

  useEffect(() => {
    localStorage.setItem('userGroup', userGroup);
  }, [userGroup]);

  // Fetch from DB on mount
  useEffect(() => {
    // 1. Try to load from cache first for instant UI
    const cached = CacheService.get();
    if (cached && cached.schedule) {
      setSchedule(cached.schedule);
      setIsLoading(false);
    }

    // 2. Always fetch latest from DB in background
    const fetchData = async () => {
      try {
        const [schedRes, examsRes] = await Promise.all([
          fetch('/api/sync?key=schedule'),
          fetch('/api/sync?key=exams')
        ]);
        
        const scheduleData = await schedRes.json();
        const examsData = await examsRes.json();
        
        if (scheduleData) {
          setSchedule(scheduleData);
          const fullCache = CacheService.get() || {};
          CacheService.save({ ...fullCache, schedule: scheduleData });
        }
        if (examsData) {
          setExams(examsData);
        }
      } catch (err) {
        console.error("Failed to load data", err);
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
          body: JSON.stringify({ schedule })
        });
      } catch (err) {
        console.error("Failed to sync schedule", err);
      }
    };

    const timeoutId = setTimeout(saveToDB, 2000);
    return () => clearTimeout(timeoutId);
  }, [schedule, isLoading]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentDayIndex = currentTime.getDay();
  const isCurrentDay = (day) => {
    const daysMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    return daysMap[day] === currentDayIndex;
  };

  const isCurrentTime = (timeStr) => {
    if (!timeStr) return false;
    
    let activeTimeStr = timeStr;
    const split = parseSplitContent(timeStr);
    
    // If time is split by group, pick the one for the current user
    if (split) {
      if (userGroup === '1') activeTimeStr = split.A || timeStr;
      else if (userGroup === '2') activeTimeStr = split.B || timeStr;
    }

    // Normalize string: "8:30 to 10:30" -> ["8:30", "10:30"]
    const parts = activeTimeStr.toLowerCase().split(/to|-/).map(p => p.trim());
    if (parts.length < 2) return false;

    const parseTime = (str) => {
      let [hours, minutes] = str.split(':').map(Number);
      if (isNaN(minutes)) minutes = 0;
      
      // Handle AM/PM if present
      if (str.includes('pm') && hours < 12) hours += 12;
      if (str.includes('am') && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };

    const start = parseTime(parts[0]);
    const end = parseTime(parts[1]);
    const current = currentTime.getHours() * 60 + currentTime.getMinutes();

    return current >= start && current < end;
  };

  const getExamsForDay = (dayName) => {
    const daysMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const targetDay = daysMap[dayName.toLowerCase()];
    
    // Find exams that fall on this day of the current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() || 7) + 1); // Monday
    
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + (targetDay - 1));
    targetDate.setHours(0,0,0,0);

    return exams.filter(exam => {
      if (exam.isTBD) {
          // If TBD, check if it's in the same week
          const examDate = new Date(exam.date);
          examDate.setHours(0,0,0,0);
          const examWeekStart = new Date(examDate);
          examWeekStart.setDate(examDate.getDate() - (examDate.getDay() || 7) + 1);
          return examWeekStart.getTime() === startOfWeek.getTime() && examDate.getDay() === (targetDay % 7);
      }
      const examDate = new Date(exam.date);
      examDate.setHours(0,0,0,0);
      return examDate.getTime() === targetDate.getTime();
    });
  };

  const getEffectiveContent = (content, dayOverride = null) => {
    if (!content) return null;
    
    // 0. Filter by Day Tag if present (e.g. {Mon} ... | {Tue} ...)
    // dayOverride should be 'monday', 'tuesday', etc.
    if (content.includes('{')) {
      const dayTags = { 
        monday: '{mon}', tuesday: '{tue}', wednesday: '{wed}', 
        thursday: '{thu}', friday: '{fri}', saturday: '{sat}' 
      };
      
      // Use current day if no override provided (for highlights)
      const targetDay = dayOverride || days[currentDayIndex - 1] || 'monday';
      const tag = dayTags[targetDay];
      
      const dayMatch = content.match(new RegExp(`\\${tag}\\s*([^{|]*)`, 'i'));
      if (dayMatch) {
        content = dayMatch[1].trim();
        // Remove trailing separators if any
        content = content.replace(/[|/]$/, '').trim();
      } else if (content.includes('|')) {
        // If there's a day-specific list but current day isn't found, 
        // try to find a "default" or just take the last part that isn't tagged
        const parts = content.split('|');
        const untagged = parts.find(p => !p.includes('{'));
        if (untagged) content = untagged.trim();
      }
    }

    const split = parseSplitContent(content);
    if (!split) return content;

    let display = content;
    // 1. Filter by Week Cycle
    if (split.wkA || split.wkB) {
      display = viewWeek === 'A' ? (split.wkA || '') : (split.wkB || '');
    }

    // 2. Re-parse and filter by Group
    const nestedSplit = parseSplitContent(display);
    if (nestedSplit) {
      if (userGroup === '1') return nestedSplit.A || '';
      if (userGroup === '2') return nestedSplit.B || '';
    } else {
      // Simple group split check
      if (userGroup === '1' && split.A !== null) return split.A || '';
      if (userGroup === '2' && split.B !== null) return split.B || '';
    }

    return display;
  };

  const handleEdit = (id, field, value) => {
    setSchedule(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const parseSplitContent = (content) => {
    if (!content) return null;
    
    let data = { A: null, B: null, wkA: null, wkB: null };
    let hasSplit = false;

    // Parse Groups [1] / [2]
    const groupMatch = content.match(/\[1\]\s*([^/|]*)\s*[\/|]\s*\[2\]\s*([^/|]*)/i);
    if (groupMatch) {
      data.A = groupMatch[1].trim(); // map 1 to A internally or just use 1/2
      data.B = groupMatch[2].trim();
      hasSplit = true;
    }

    // Parse Weeks (Wk A) / (Wk B)
    const weekMatch = content.match(/\(Wk A\)\s*([^/|]*)\s*[\/|]\s*\(Wk B\)\s*([^/|]*)/i);
    if (weekMatch) {
      data.wkA = weekMatch[1].trim();
      data.wkB = weekMatch[2].trim();
      hasSplit = true;
    }

    return hasSplit ? data : null;
  };

  const renderCell = (row, field) => {
    const content = row[field];
    if (isAdmin) {
      return (
        <div 
          onClick={() => setEditingCell({ id: row.id, field, value: content || '' })}
          style={{ 
            cursor: 'pointer',
            padding: '0.75rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed var(--glass-border)',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minHeight: '50px',
            justifyContent: 'center',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
          }}
        >
          <span style={{ fontSize: '0.85rem', color: content ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: content ? 600 : 400 }}>
            {content || (field === 'time' ? 'Set Time' : 'Empty')}
          </span>
          {content && (content.includes('[1]') || content.includes('(Wk A)') || content.includes('{')) && (
            <span style={{ 
              fontSize: '0.6rem', 
              color: 'var(--accent-primary)', 
              fontWeight: 800, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Complex Rule
            </span>
          )}
          <div style={{ position: 'absolute', top: '4px', right: '4px', color: 'var(--text-tertiary)', opacity: 0.5 }}>
            <HelpCircle size={10} />
          </div>
        </div>
      );
    }

    if (!content) return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>—</span>;

    const effective = getEffectiveContent(content, field === 'time' ? days[currentDayIndex - 1] : field);
    if (!effective || effective.trim() === '') {
      return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>—</span>;
    }

    return effective;
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (isLoading) {
    return (
      <PageTransition>
        <div style={{ marginBottom: '2rem' }}>
          <Skeleton width="350px" height="3.5rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="250px" height="1.25rem" />
        </div>
        <Skeleton height="500px" variant="glass" />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-gradient"
              style={{ fontSize: 'var(--text-4xl)', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-1px' }}
            >
              Class Schedule
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}
            >
              Your weekly timetable at a glance.
            </motion.p>
          </div>
          {isAdmin && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, background: 'rgba(99, 102, 241, 0.2)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHelp(!showHelp)}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: showHelp ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: showHelp ? 'white' : 'var(--accent-primary)',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: showHelp ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none'
              }}
              title="Admin Help"
            >
              <HelpCircle size={24} />
            </motion.button>
          )}
        </div>

        {isAdmin && showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.4, ease: 'circOut' }}
            style={{ overflow: 'hidden' }}
          >
            <GlassCard style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                <Info size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Admin Formatting Guide</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Split Groups (1 & 2)</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Use square brackets to define subjects for specific groups.
                  </p>
                  <code style={{ display: 'block', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                    [1] Subject 1 / [2] Subject 2
                  </code>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Week Cycles (A & B)</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Use parentheses to define subjects for alternating weeks.
                  </p>
                  <code style={{ display: 'block', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                    (Wk A) Subject / (Wk B) Subject
                  </code>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Mixed Rules</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    You can nest rules to handle complex scenarios.
                  </p>
                  <code style={{ display: 'block', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                    (Wk A) [1] CS / [2] Physics / (Wk B) Math
                  </code>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Day Overrides (Advanced)</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Specify different values for different days in one cell.
                  </p>
                  <code style={{ display: 'block', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                    {'{Mon}'} 8:00 | {'{Tue}'} 8:30
                  </code>
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontSize: '0.8rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                Changes are automatically synced to all students.
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Selectors Container */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Group Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '0.35rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {['1', '2'].map((group) => (
              <button
                key={group}
                onClick={() => setUserGroup(group)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  background: userGroup === group ? 'var(--accent-primary)' : 'transparent',
                  color: userGroup === group ? 'white' : 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Group {group}
              </button>
            ))}
          </motion.div>

          {/* Week Selector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              display: 'inline-flex',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '0.35rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(10px)',
              position: 'relative'
            }}
          >
            {['A', 'B'].map((wk) => (
              <button
                key={wk}
                onClick={() => setViewWeek(wk)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  background: viewWeek === wk ? 'var(--accent-secondary)' : 'transparent',
                  color: viewWeek === wk ? 'white' : 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'relative'
                }}
              >
                Week {wk}
                {currentRealWeek === wk && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-4px', 
                    right: '-4px', 
                    background: 'var(--status-success)', 
                    color: 'white', 
                    fontSize: '0.6rem', 
                    padding: '2px 4px', 
                    borderRadius: '4px',
                    fontWeight: 800,
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
                  }}>
                    NOW
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </div>
        {isAdmin && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              padding: '0.5rem 0.875rem',
              background: 'var(--accent-primary-light)',
              color: 'var(--accent-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}
          >
            <span style={{ width: 8, height: 8, background: 'var(--accent-primary)', borderRadius: '50%' }} />
            Admin Mode: Click any cell to edit
          </motion.span>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginTop: '2rem' }}
        >
          <GlassCard style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '900px' }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '1.25rem 1rem',
                    borderBottom: '2px solid var(--glass-border)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    minWidth: '120px'
                  }}>
                    Time
                  </th>
                  {days.map((day, index) => {
                    const activeDay = isCurrentDay(day);
                    const dayExams = getExamsForDay(day);
                    return (
                    <th
                      key={day}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        padding: '1.5rem 1rem',
                        borderBottom: activeDay ? '2px solid var(--accent-primary)' : '2px solid var(--glass-border)',
                        background: activeDay ? 'rgba(99, 102, 241, 0.15)' : (index === 5 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.3)'),
                        color: activeDay ? 'var(--text-primary)' : (index === 5 ? 'var(--accent-secondary)' : 'var(--accent-primary)'),
                        fontSize: '0.8rem',
                        fontWeight: activeDay ? 800 : 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        minWidth: '140px',
                        position: 'relative',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                        {dayNames[index]}
                        {dayExams.length > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: 'var(--status-danger)',
                              boxShadow: '0 0 10px var(--status-danger)',
                            }}
                          />
                        )}
                      </div>

                      {/* Exam Tooltip */}
                      {hoveredDay === day && dayExams.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 100,
                            marginTop: '0.5rem',
                            minWidth: '200px',
                            padding: '1rem',
                            background: 'rgba(15, 15, 19, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            textAlign: 'left',
                            pointerEvents: 'none'
                          }}
                        >
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.7rem', color: 'var(--status-danger)', fontWeight: 800, textTransform: 'uppercase' }}>
                            Exams this {dayNames[index]}
                          </p>
                          {dayExams.map(ex => (
                            <div key={ex.id} style={{ marginBottom: '0.5rem' }}>
                              <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{ex.subject}</div>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                                {ex.isTBD ? 'Tentative' : ex.time} • {ex.location}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {(index === 5 || activeDay) && (
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          right: '50%',
                          transform: 'translateX(50%)',
                          width: '4px',
                          height: '4px',
                          background: activeDay ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                          borderRadius: '50%',
                          boxShadow: `0 0 8px ${activeDay ? 'var(--accent-primary)' : 'var(--accent-secondary)'}`
                        }} />
                      )}
                    </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {schedule.map((slot, index) => (
                  <motion.tr
                    key={slot.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    style={{
                      transition: 'background var(--transition-base)'
                    }}
                  >
                    <td style={{
                      padding: '1rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      background: 'rgba(0, 0, 0, 0.15)',
                      minWidth: '120px'
                    }}>
                      {renderCell(slot, 'time')}
                    </td>
                    {days.map((day) => {
                      const effective = getEffectiveContent(slot[day], day);
                      const activeTimeStr = getEffectiveContent(slot.time, day);
                      const isActive = isCurrentDay(day) && isCurrentTime(activeTimeStr) && effective && effective.trim() !== '';
                      return (
                      <td
                        key={`${slot.id}-${day}`}
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: isActive 
                              ? 'rgba(99, 102, 241, 0.25)' 
                              : slot[day]
                                  ? index === 5
                                      ? 'rgba(139, 92, 246, 0.08)'
                                      : 'rgba(99, 102, 241, 0.08)'
                                  : 'transparent',
                          transition: 'background var(--transition-base)',
                          fontSize: '0.9rem',
                          fontWeight: slot[day] ? (isActive ? 700 : 500) : 400,
                          color: slot[day] ? (isActive ? 'var(--accent-primary)' : 'var(--text-primary)') : 'var(--text-muted)',
                          boxShadow: isActive ? 'inset 0 0 0 1px var(--accent-primary)' : 'none',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!slot[day] && !isActive) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!slot[day] && !isActive) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {isActive && (
                          <motion.span
                              animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              style={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: 'var(--accent-primary)',
                                  boxShadow: '0 0 8px var(--accent-primary)'
                              }}
                          />
                        )}
                        {renderCell(slot, day)}
                      </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>
      </>

      {/* Cell Editor Modal */}
      {editingCell && (
        <CellEditor 
          cell={editingCell} 
          onClose={() => setEditingCell(null)} 
          onSave={(newValue) => {
            handleEdit(editingCell.id, editingCell.field, newValue);
            setEditingCell(null);
          }}
        />
      )}
    </PageTransition>
  );
};

const CellEditor = ({ cell, onClose, onSave }) => {
  const [type, setType] = useState('simple'); // simple, split_group, split_week
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [dayOverride, setDayOverride] = useState('all');

  useEffect(() => {
    // Basic auto-detection of current content to prepopulate
    const c = cell.value;
    if (c.includes('[1]')) {
      const m = c.match(/\[1\]\s*([^/|]*)\s*[\/|]\s*\[2\]\s*([^/|]*)/i);
      if (m) { setType('split_group'); setVal1(m[1].trim()); setVal2(m[2].trim()); }
    } else if (c.includes('(Wk A)')) {
      const m = c.match(/\(Wk A\)\s*([^/|]*)\s*[\/|]\s*\(Wk B\)\s*([^/|]*)/i);
      if (m) { setType('split_week'); setVal1(m[1].trim()); setVal2(m[2].trim()); }
    } else {
      setVal1(c);
    }
  }, [cell.value]);

  const handleSave = () => {
    let final = val1;
    if (type === 'split_group') final = `[1] ${val1} / [2] ${val2}`;
    if (type === 'split_week') final = `(Wk A) ${val1} / (Wk B) ${val2}`;
    
    // Day wrap if selected
    if (dayOverride !== 'all') {
      const dayTags = { monday: '{Mon}', tuesday: '{Tue}', wednesday: '{Wed}', thursday: '{Thu}', friday: '{Fri}', saturday: '{Sat}' };
      final = `${dayTags[dayOverride]} ${final}`;
    }
    
    onSave(final);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(20, 20, 25, 0.95)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
            Edit {cell.field === 'time' ? 'Timing' : 'Subject'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Format Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Format Type</label>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              {['simple', 'split_group', 'split_week'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: type === t ? 'var(--accent-primary)' : 'transparent',
                    color: type === t ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Value Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                {type === 'simple' ? 'Value' : type === 'split_group' ? 'Group 1 Value' : 'Week A Value'}
              </label>
              <input
                value={val1}
                onChange={e => setVal1(e.target.value)}
                placeholder="e.g. 8:00 to 10:00"
                style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
              />
            </div>

            {type !== 'simple' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
                  {type === 'split_group' ? 'Group 2 Value' : 'Week B Value'}
                </label>
                <input
                  value={val2}
                  onChange={e => setVal2(e.target.value)}
                  placeholder="e.g. 8:30 to 10:30"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
              </motion.div>
            )}
          </div>

          {/* Day Override */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Apply To Day</label>
            <select 
              value={dayOverride} 
              onChange={e => setDayOverride(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }}
            >
              <option value="all">Every Day (Standard)</option>
              <option value="monday">Monday Only</option>
              <option value="tuesday">Tuesday Only</option>
              <option value="wednesday">Wednesday Only</option>
              <option value="thursday">Thursday Only</option>
              <option value="friday">Friday Only</option>
              <option value="saturday">Saturday Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
            <button 
              onClick={handleSave} 
              style={{ flex: 2, padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--accent-primary)', color: 'white', cursor: 'pointer', fontWeight: 800, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Schedule;
