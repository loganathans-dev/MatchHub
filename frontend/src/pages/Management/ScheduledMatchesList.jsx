import { request } from '../../utils/request';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Auth.css';

const ScheduledMatchesList = () => {
  const [filterDate, setFilterDate] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;

  useEffect(() => {
    if (!eventId) {
      navigate('/management/event-list', { state: { action: 'matches' } });
      return;
    }

    const fetchMatchesAndEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const [matchRes, eventRes] = await Promise.all([
          request(`${import.meta.env.VITE_API_URL || ""}/api/matches${eventId ? `?eventId=${eventId}` : ''}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          request(`${import.meta.env.VITE_API_URL || ""}/api/events`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (eventRes.ok && eventId) {
          const eventsData = await eventRes.json();
          const currentEvent = eventsData.find(e => e._id === eventId);
          if (currentEvent) setActiveEvent(currentEvent);
        }

        if (matchRes.ok) {
          const data = await matchRes.json();
          const formattedMatches = data.map(m => ({
            id: m._id,
            title: m.sportName + ' - ' + (m.type === 'team' ? `${m.teamA?.name} vs ${m.teamB?.name}` : 'Multi-Participant'),
            type: m.type,
            sportName: m.sportName,
            dateTime: m.dateTime,
            status: m.status
          }));
          setMatches(formattedMatches);
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchesAndEvent();
  }, [eventId, navigate]);


  // Filter matches based on the selected date (if any)
  const filteredMatches = filterDate
    ? matches.filter(match => new Date(match.dateTime).toLocaleDateString('en-CA') === filterDate)
    : matches;

  // Group matches "sports wise"
  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const sport = match.sportName || 'Other';
    if (!groups[sport]) {
      groups[sport] = [];
    }
    groups[sport].push(match);
    return groups;
  }, {});

  return (
    <div aria-label={activeEvent?.title || "Scheduled matches"} className="auth-container" style={{ padding: '40px 20px', minHeight: '100vh', alignItems: 'flex-start' }}>
      <div className="auth-card wide" style={{ maxWidth: '1000px', width: '100%' }}>
        <Link to="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-link" style={{ display: 'flex', width: 'fit-content', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div className="auth-header responsive-flex-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="auth-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Scheduled Matches</h1>
            <p className="auth-subtitle" style={{ textAlign: 'left' }}>View all scheduled fixtures categorized by sport</p>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px', margin: 0 }}
            onClick={() => navigate('/management/match-schedule')}
          >
            + Schedule Match
          </button>
        </div>

        {loading ? (
          null
        ) : (
          <>

        {/* Filters Section */}
        <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 200px', minWidth: '200px', margin: 0 }}>
            <label className="form-label" htmlFor="scheduledmatcheslist-field-1">Filter by Date</label>
            <input id="scheduledmatcheslist-field-1"
              type="date"
              className="form-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 24px', margin: 0, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            onClick={() => setFilterDate('')}
          >
            Clear Filter
          </button>
        </div>

        {/* Grouped Matches List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.keys(groupedMatches).length > 0 ? (
            Object.keys(groupedMatches).map(sport => (
              <div key={sport}>
                <h2 style={{
                  color: 'var(--primary-color)',
                  borderBottom: '2px solid var(--border-color)',
                  paddingBottom: '8px',
                  marginBottom: '16px',
                  fontSize: '20px'
                }}>
                  {sport}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {groupedMatches[sport].map(match => {
                    const matchDate = new Date(match.dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    const matchTime = new Date(match.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={match.id} className="responsive-flex-card" style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '20px',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div style={{ flex: 2 }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            background: match.type === 'team' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: match.type === 'team' ? '#60a5fa' : '#34d399',
                            marginBottom: '8px'
                          }}>
                            {match.type === 'team' ? 'Team Match' : 'Multi-Participant'}
                          </span>
                          <h3 style={{ color: 'var(--text-main)', fontSize: '18px', marginBottom: '8px' }}>
                            {match.title}
                          </h3>
                          <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', gap: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                              {matchDate}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              {matchTime}
                            </span>
                          </div>
                        </div>

                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            background: match.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: match.status === 'Completed' ? '#34d399' : '#fbbf24',
                            border: `1px solid ${match.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                          }}>
                            {match.status}
                          </span>

                          <button
                            style={{
                              display: 'block',
                              marginTop: '12px',
                              marginLeft: 'auto',
                              padding: '6px 16px',
                              background: 'transparent',
                              border: '1px solid var(--primary-color)',
                              color: 'var(--primary-color)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = 'var(--primary-color)'; e.target.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary-color)'; }}
                            onClick={() => navigate('/management/match-result', { state: { matchId: match.id } })}
                          >
                            Update Result
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--input-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              No matches found for the selected date.
            </div>
          )}
        </div>
        </>
        )}

      </div>
    </div>
  );
};

export default ScheduledMatchesList;
