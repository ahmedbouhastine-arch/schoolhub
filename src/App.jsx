import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Teachers from './pages/Teachers';
import Exams from './pages/Exams';
import Lessons from './pages/Lessons';
import AdminAuth from './pages/AdminAuth';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', marginLeft: 'var(--sidebar-width)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/admin" element={<AdminAuth />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
