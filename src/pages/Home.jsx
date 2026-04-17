import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, BookOpen, Calendar, TrendingUp, Bell } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import PageTransition from '../components/PageTransition';

const StatCard = ({ icon: Icon, title, value, subtitle, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, type: 'spring', stiffness: 280, damping: 32 }}
  >
    <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
      <div style={{
        padding: '0.875rem',
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        borderRadius: '14px',
        color: color.replace('0.15', '1'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '52px',
        minHeight: '52px',
        boxShadow: `0 4px 16px ${color}20`,
        border: `1px solid ${color}30`
      }}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
        {subtitle && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
    </GlassCard>
  </motion.div>
);

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <PageTransition>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-gradient"
              style={{ fontSize: '2.75rem', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-1px' }}
            >
              Good Morning, Student
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}
            >
              Here's what's happening in your classes today.
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--text-primary)',
              fontWeight: 500,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all var(--transition-base)'
            }}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </motion.button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard
            icon={Calendar}
            title="Today's Classes"
            value="4"
            subtitle="2 completed"
            color="var(--accent-primary)"
            delay={0.1}
          />
          <StatCard
            icon={Clock}
            title="Next Class"
            value="10:15"
            subtitle="Advanced Mathematics"
            color="var(--status-info)"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            title="Average Grade"
            value="87%"
            subtitle="+3% this week"
            color="var(--status-success)"
            delay={0.3}
          />
          <StatCard
            icon={BookOpen}
            title="Assignments"
            value="2"
            subtitle="Due this week"
            color="var(--status-warning)"
            delay={0.4}
          />
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Current Class Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <GlassCard style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              {/* Background accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, var(--accent-primary-light) 0%, transparent 70%)',
                opacity: 0.5,
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', position: 'relative' }}>
                <div style={{
                  padding: '0.875rem',
                  background: 'var(--accent-primary-light)',
                  borderRadius: '14px',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)'
                }}>
                  <Clock size={24} strokeWidth={2} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Current Class</h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>10:15 AM - 11:45 AM</p>
                </div>
              </div>

              <div style={{
                padding: '1.25rem',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>Advanced Mathematics</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> Room 302
                  </span>
                  <span style={{ opacity: 0.5 }}>•</span>
                  <span>Mr. Anderson</span>
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Next Exam Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <GlassCard style={{ height: '100%', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{
                  padding: '0.875rem',
                  background: 'var(--status-danger-bg)',
                  borderRadius: '14px',
                  color: 'var(--status-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
                }}>
                  <AlertCircle size={24} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Next Exam</h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>In 3 Days</p>
                </div>
                <StatusBadge status="upcoming" text="Priority" />
              </div>

              <div style={{
                padding: '1.25rem',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>Physics Midterm</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> Oct 24, 9:00 AM
                  </span>
                  <span style={{ opacity: 0.5 }}>•</span>
                  <span>Main Hall</span>
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Teacher Updates Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <GlassCard style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{
                  padding: '0.875rem',
                  background: 'var(--status-warning-bg)',
                  borderRadius: '14px',
                  color: 'var(--status-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)'
                }}>
                  <BookOpen size={24} strokeWidth={2} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Teacher Updates</h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Absences & Substitutes</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  transition: 'all var(--transition-base)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Mrs. Smith</span>
                    <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Biology</p>
                  </div>
                  <StatusBadge status="absent" text="Absent" />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Mr. Davis</span>
                    <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>History</p>
                  </div>
                  <StatusBadge status="substitute" text="Substitute" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </PageTransition>
  );
};

export default Home;
