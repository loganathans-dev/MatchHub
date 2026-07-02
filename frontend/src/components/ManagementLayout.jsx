import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Users, ClipboardList, CalendarCheck, Trophy, Medal, Menu, X } from 'lucide-react';
import '../styles/Auth.css';

const ManagementNavbar = () => {
  const location = useLocation();
  const eventId = location.state?.eventId;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Pass the eventId in state if it exists, so context isn't lost
  const navState = eventId ? { eventId } : {};

  const navItems = [
    { title: 'Home', path: '/management/home', icon: <Home size={18} /> },
    { title: 'Sports Event', path: '/management/sports-day-event', icon: <CalendarDays size={18} /> },
    { title: 'Departments', path: '/management/department-registration', state: navState, icon: <Users size={18} /> },
    { title: 'Schedule', path: '/management/match-schedule', state: navState, icon: <ClipboardList size={18} /> },
    { title: 'Matches', path: '/management/scheduled-matches', state: navState, icon: <CalendarCheck size={18} /> },
    { title: 'Results', path: '/management/match-result', state: navState, icon: <Trophy size={18} /> },
    { title: 'Points Table', path: '/management/points-table', state: navState, icon: <Medal size={18} /> },
  ];

  return (
    <nav style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div className="nav-bar-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 20px',
      }}>
        {/* Desktop Menu */}
        <div className="desktop-nav">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={index}
                to={item.path}
                state={item.state}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? 'var(--primary-color)' : 'transparent',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                {item.icon}
                {item.title}
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          <span style={{ marginLeft: '8px', fontWeight: 500 }}>Menu</span>
        </button>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-dropdown">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  state={item.state}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? '#fff' : '#94a3b8',
                    background: isActive ? 'var(--primary-color)' : 'transparent',
                    fontWeight: 500,
                    fontSize: '16px',
                  }}
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

const ManagementLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <ManagementNavbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default ManagementLayout;
