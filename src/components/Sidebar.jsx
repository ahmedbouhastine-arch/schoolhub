import { NavLink } from 'react-router-dom';
import { Home, Calendar, Users, FileText, Folder, Lock } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Teachers', path: '/teachers', icon: Users },
    { name: 'Exams', path: '/exams', icon: FileText },
    { name: 'Lessons', path: '/lessons', icon: Folder },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-brand">
        <h1 className="text-gradient">SchoolHub</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ opacity: 0.7 }}>
          <Lock size={20} />
          <span>Admin Portal</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
