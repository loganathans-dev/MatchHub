import { request } from '../../utils/request';
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Trophy } from 'lucide-react';
import './StudentPortal.css';



const StudentEventList = () => {
  const { id: collegeId } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = React.useState({ collegeName: '' });
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegeRes, eventsRes] = await Promise.all([
          request(`${import.meta.env.VITE_API_URL || ""}/api/public/colleges/${collegeId}`),
          request(`${import.meta.env.VITE_API_URL || ""}/api/public/events?collegeId=${collegeId}`)
        ]);
        if (collegeRes.ok) {
          setCollege(await collegeRes.json());
        }
        if (eventsRes.ok) {
          const allEvents = await eventsRes.json();
          const collegeEvents = allEvents.filter(e => e.college?._id === collegeId);
          const formatted = collegeEvents.map(e => ({
            id: e._id,
            title: e.title,
            date: new Date(e.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            venue: 'Venue not specified',
            status: e.status || 'Upcoming'
          }));
          setEvents(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [collegeId]);

  const handleEventClick = (eventId) => {
    navigate(`/students/colleges/${collegeId}/events/${eventId}`);
  };

  return (
    <div className="student-portal-container">
      <div className="container">
        <div className="back-arrow-wrapper">
          <Link to="/students/colleges" className="back-link" style={{ marginBottom: '2rem', display: 'inline-flex' }} title="Back to Colleges">
            <ArrowLeft className="back-arrow-icon" strokeWidth={3} color="#fff" />
          </Link>
        </div>

        <div className="dashboard-header">
          <div className="header-info">
            <h1 className="student-title">{college.collegeName} Events</h1>
            <p className="student-subtitle">Select an event to view schedules, results, and point tables</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px', marginTop: '2rem' }}>
          {loading ? (
            null
          ) : events.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)' }}>No events published for this college yet.</div>
          ) : (
          events.map(event => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              role="link" tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') handleEventClick(event.id); }}
              className="student-event-card"
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

              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'white' }}>{event.title}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
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

export default StudentEventList;
