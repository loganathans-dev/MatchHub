import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Trophy } from 'lucide-react';
import '../../styles/Auth.css';



const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map(e => ({
            id: e._id,
            title: e.title,
            date: new Date(e.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            venue: 'Main College Ground',
            status: e.status || 'Upcoming'
          }));
          setEvents(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Extract the intended action from state (e.g., 'matches', 'results', 'points')
  const action = location.state?.action || 'default';

  const handleEventClick = (eventId) => {
    // Route based on the action passed from ManagementHome
    switch (action) {
      case 'department':
        navigate('/management/department-registration', { state: { eventId } });
        break;
      case 'schedule':
        navigate('/management/match-schedule', { state: { eventId } });
        break;
      case 'matches':
        navigate('/management/scheduled-matches', { state: { eventId } });
        break;
      case 'results':
        navigate('/management/match-result', { state: { eventId } });
        break;
      case 'points':
        navigate('/management/points-table', { state: { eventId } });
        break;
      default:
        // Fallback if no specific action was passed
        navigate('/management/sports-day-event');
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'department': return 'Department Registration';
      case 'schedule': return 'Create Match Schedule';
      case 'matches': return 'View Scheduled Matches';
      case 'results': return 'Update Match Results';
      case 'points': return 'View Points Table';
      default: return 'Select an Event';
    }
  };

  return (
    <div className="auth-container" style={{ padding: '40px 20px', minHeight: '100vh', alignItems: 'flex-start' }}>
      <div className="auth-card wide" style={{ maxWidth: '1000px', width: '100%' }}>
        <Link to="/management/home" className="auth-link" style={{ display: 'flex', width: 'fit-content', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div className="auth-header">
          <h1 className="auth-title">{getActionTitle()}</h1>
          <p className="auth-subtitle">Please select an event to continue</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No events found.</div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'var(--input-bg)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '12px', color: '#38bdf8' }}>
                    <Trophy size={24} />
                  </div>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    background: event.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: event.status === 'Completed' ? '#34d399' : '#fbbf24',
                    border: `1px solid ${event.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}>
                    {event.status}
                  </span>
                </div>

                <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'var(--text-main)' }}>{event.title}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} /> {event.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> {event.venue}
                  </div>
                </div>
              </div>
            )))}
        </div>

      </div>
    </div>
  );
};

export default EventList;
