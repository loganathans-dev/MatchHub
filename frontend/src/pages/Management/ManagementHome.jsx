import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  ClipboardList,
  Trophy,
  Medal,
  LogOut,
  CalendarCheck
} from 'lucide-react';
import '../../styles/Auth.css'; // Reusing base container styles

const ManagementHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('collegeInfo');
    navigate('/management/signin');
  };

  const navItems = [
    {
      title: 'Sports Day Event',
      description: 'Create events with dates, a sports list, and event information.',
      icon: <CalendarDays size={32} color="#38bdf8" />,
      path: '/management/sports-day-event'
    },
    {
      title: 'Department Registration',
      description: 'Register departments for selected event sports.',
      icon: <Users size={32} color="#818cf8" />,
      path: '/management/event-list',
      state: { action: 'department' }
    },
    {
      title: 'Match Schedule',
      description: 'Create and manage fixtures for different sports.',
      icon: <ClipboardList size={32} color="#f472b6" />,
      path: '/management/event-list',
      state: { action: 'schedule' }
    },
    {
      title: 'Scheduled Matches',
      description: 'View scheduled fixtures by event, sport, and date.',
      icon: <CalendarCheck size={32} color="#34d399" />,
      path: '/management/event-list',
      state: { action: 'matches' }
    },
    {
      title: 'Match Results',
      description: 'Record scores and declare winners for completed matches.',
      icon: <Trophy size={32} color="#fbbf24" />,
      path: '/management/event-list',
      state: { action: 'results' }
    },
    {
      title: 'Points Table',
      description: 'View overall department standings and medals.',
      icon: <Medal size={32} color="#a78bfa" />,
      path: '/management/event-list',
      state: { action: 'points' }
    }
  ];

  return (
    <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

        <header className="responsive-flex-header" style={{ marginBottom: '3rem' }}>
          <div>
            <h1 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Management Dashboard</h1>
            <p className="auth-subtitle" style={{ textAlign: 'left' }}>Central control panel for your college sports event</p>
          </div>
          <button
            onClick={handleLogout}
            className="align-right-mobile"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem', borderRadius: '8px', color: '#f8fafc',
              cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500, fontSize: '0.875rem'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem'
        }}>
          {navItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path, { state: item.state })}
              role="link" tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") navigate(item.path, { state: item.state }); }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '16px',
                marginBottom: '1.5rem'
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 0.75rem 0' }}>
                {item.title}
              </h3>
              <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ManagementHome;
