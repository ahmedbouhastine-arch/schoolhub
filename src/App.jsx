import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Skeleton from './components/Skeleton';

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
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', marginLeft: 'var(--sidebar-width)' }}>
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
    </div>
  );
}

export default App;
