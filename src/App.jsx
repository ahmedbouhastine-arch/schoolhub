import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Skeleton from './components/Skeleton';
import { Menu, X } from 'lucide-react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Teachers = lazy(() => import('./pages/Teachers'));
const Exams = lazy(() => import('./pages/Exams'));
const ExamDetails = lazy(() => import('./pages/ExamDetails'));
const Subjects = lazy(() => import('./pages/Subjects'));
const SubjectDetails = lazy(() => import('./pages/SubjectDetails'));
const AdminAuth = lazy(() => import('./pages/AdminAuth'));

const LoadingFallback = () => (
  <div style={{ padding: '2rem' }}>
    <Skeleton width="400px" height="3.5rem" style={{ marginBottom: '1rem' }} />
    <Skeleton width="100%" height="200px" variant="glass" />
  </div>
);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 1001,
          padding: '0.75rem',
          background: 'var(--accent-gradient)',
          color: 'white',
          borderRadius: '12px',
          display: 'none', // Shown via CSS media query
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
            display: 'none' // Shown via CSS
          }}
        />
      )}

      <Sidebar isOpen={sidebarOpen} />
      
      <main style={{ 
        flex: 1, 
        padding: 'var(--space-6)', 
        overflowY: 'auto', 
        marginLeft: 'var(--sidebar-width)',
        transition: 'margin-left 0.3s ease',
        width: '100%'
      }}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:id" element={<ExamDetails />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:id" element={<SubjectDetails />} />
            <Route path="/admin" element={<AdminAuth />} />
          </Routes>
        </Suspense>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
