import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Auth.css';
import { AVAILABLE_SPORTS } from '../../utils/constants';

const MatchSchedule = () => {
  const [formData, setFormData] = useState({
    sportId: '',
    teamAId: '',
    teamBId: '',
    participatingTeamIds: [], // Used for individual/athletics events
    matchDateTime: ''
  });
  
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventSports, setEventSports] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;

  useEffect(() => {
    if (!eventId) {
      navigate('/management/event-list', { state: { action: 'schedule' } });
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const eventRes = await fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (eventRes.ok) {
          const data = await eventRes.json();
          setEvents(data);
          
          let currentEvent = null;
          if (eventId) {
            currentEvent = data.find(e => e._id === eventId);
          }
          if (!currentEvent && data.length > 0) {
            currentEvent = data[0]; // Default to most recent/first event
          }
          
          if (currentEvent) {
            setActiveEvent(currentEvent);
            if (currentEvent.sportsList) {
              const mappedSports = currentEvent.sportsList.map(sportName => {
                const found = AVAILABLE_SPORTS.find(s => s.name === sportName);
                return found || { id: sportName, name: sportName, type: 'team' };
              });
              setEventSports(mappedSports);
            }

            // Pre-fill the date and time to the event's start date so the calendar opens on the correct month
            if (currentEvent.startDate) {
              const date = new Date(currentEvent.startDate);
              if (!isNaN(date.getTime())) {
                const offset = date.getTimezoneOffset() * 60000;
                const localDate = new Date(date.getTime() - offset);
                setFormData(prev => ({
                  ...prev,
                  matchDateTime: prev.matchDateTime || localDate.toISOString().slice(0, 16)
                }));
              }
            }

            // Now fetch departments using the resolved event ID
            const deptRes = await fetch(`/api/departments?eventId=${currentEvent._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (deptRes.ok) {
              const deptData = await deptRes.json();
              setDepartments(deptData.map(d => ({ ...d, id: d._id })));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [eventId]);

  const selectedSport = eventSports.find(s => s.id === formData.sportId) || AVAILABLE_SPORTS.find(s => s.id === formData.sportId);
  const isTeamSport = selectedSport ? selectedSport.type === 'team' : true;

  const toLocalDatetimeLocal = (dateString, isEnd = false) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    const isoString = localDate.toISOString().slice(0, 16);
    // Relax the time restriction to the full day so users don't get blocked by strict minutes
    if (isEnd) {
      return isoString.split('T')[0] + 'T23:59';
    } else {
      return isoString.split('T')[0] + 'T00:00';
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.registeredSports && dept.registeredSports.includes(formData.sportId)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (field, type, value) => {
    setFormData(prev => {
      const currentVal = prev[field] || '';
      let datePart = '';
      let timePart = '';
      
      if (currentVal.includes('T')) {
        [datePart, timePart] = currentVal.split('T');
      } else {
        datePart = currentVal;
      }

      if (type === 'date') {
        datePart = value;
        if (datePart && !timePart) {
          timePart = '09:00';
        }
      } else if (type === 'time') {
        timePart = value;
        if (timePart && !datePart) {
          const tzOffset = (new Date()).getTimezoneOffset() * 60000;
          datePart = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
        }
      }

      if (!datePart && !timePart) {
        return { ...prev, [field]: '' };
      }

      return { ...prev, [field]: `${datePart}T${timePart}` };
    });
  };

  const handleParticipantToggle = (teamId) => {
    setFormData(prev => {
      const currentParticipants = prev.participatingTeamIds;
      if (currentParticipants.includes(teamId)) {
        return { ...prev, participatingTeamIds: currentParticipants.filter(id => id !== teamId) };
      } else {
        return { ...prev, participatingTeamIds: [...currentParticipants, teamId] };
      }
    });
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setError('');

    if (!formData.sportId || !formData.matchDateTime) {
      setError('Please select a sport and a date/time.');
      return;
    }

    if (!formData.matchDateTime.includes('T') || !formData.matchDateTime.split('T')[0] || !formData.matchDateTime.split('T')[1]) {
      setError('Please provide both valid date and time for the match.');
      return;
    }

    if (activeEvent) {
      const matchDate = new Date(formData.matchDateTime);
      const eventStart = new Date(activeEvent.startDate);
      const eventEnd = new Date(activeEvent.endDate);
      
      if (matchDate < eventStart || matchDate > eventEnd) {
        setError(`Match date and time must be between the event timeline (${eventStart.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} — ${eventEnd.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}).`);
        return;
      }
    }

    if (isTeamSport) {
      if (!formData.teamAId || !formData.teamBId) {
        setError('Please select both Team A and Team B.');
        return;
      }
      if (formData.teamAId === formData.teamBId) {
        setError('A team cannot play against itself. Please select different teams.');
        return;
      }
    } else {
      if (formData.participatingTeamIds.length === 0) {
        setError('Please select at least one participating team/member for this event.');
        return;
      }
    }

    const payload = {
      event: eventId || (events.length > 0 ? events[0]._id : null), 
      sportName: selectedSport.name,
      dateTime: formData.matchDateTime,
      type: isTeamSport ? 'team' : (selectedSport.type === 'individual' ? 'individual' : 'athletics'),
    };

    if (isTeamSport) {
      payload.teamA = formData.teamAId;
      payload.teamB = formData.teamBId;
    } else {
      payload.participants = formData.participatingTeamIds;
    }

    console.log(`Scheduling Match (${action}):`, payload);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (action === 'add_another') {
          alert('Event Scheduled! You can schedule another one now.');
          setFormData(prev => ({
            ...prev,
            teamAId: '',
            teamBId: '',
            participatingTeamIds: [],
            matchDateTime: ''
          }));
        } else {
          alert('Event Scheduled Successfully!');
          navigate('/management/scheduled-matches', { state: { eventId } });
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to schedule match');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  return (
    <div className="auth-container" style={{ padding: '40px 20px' }}>
      <div className="auth-card wide">
        <Link to="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-link" style={{ display: 'flex', width: 'fit-content', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div className="auth-header responsive-flex-header">
          <div>
            <h1 className="auth-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Schedule Events & Matches</h1>
            <p className="auth-subtitle" style={{ textAlign: 'left' }}>Set up fixtures by selecting the sport, the competing teams/participants, and the time</p>
            {activeEvent && (
              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'inline-block', textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#60a5fa', fontWeight: '500' }}>
                  <span style={{ marginRight: '6px' }}>📅</span>
                  Event Timeline: {new Date(activeEvent.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} — {new Date(activeEvent.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            )}
          </div>
          <button 
            type="button"
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 24px', margin: 0, background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontSize: '14px' }}
            onClick={() => navigate('/management/scheduled-matches', { state: { eventId: activeEvent?._id || eventId } })}
          >
            View Scheduled Matches
          </button>
        </div>

        <form className="auth-form" onSubmit={(e) => handleSubmit(e, 'save_and_redirect')}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group full-width">
            <label className="form-label">Select Sport or Event *</label>
            <select 
              name="sportId" 
              className="form-input" 
              value={formData.sportId}
              onChange={(e) => {
                handleInputChange(e);
                // Clear team selections when switching sport types to avoid dirty state
                setFormData(prev => ({ ...prev, teamAId: '', teamBId: '', participatingTeamIds: [] }));
              }}
              required
            >
              <option value="" disabled>Choose the sport for this event...</option>
              <optgroup label="Team Sports (Team vs Team)">
                {eventSports.filter(s => s.type === 'team').map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </optgroup>
              <optgroup label="Individual & Athletics (Multiple Participants)">
                {eventSports.filter(s => s.type !== 'team').map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {formData.sportId && (
            isTeamSport ? (
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Team A *</label>
                  <select 
                    name="teamAId" 
                    className="form-input" 
                    value={formData.teamAId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Team A</option>
                    {filteredDepartments.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Team B *</label>
                  <select 
                    name="teamBId" 
                    className="form-input" 
                    value={formData.teamBId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Team B</option>
                    {filteredDepartments.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="form-group full-width">
                <label className="form-label" style={{ marginBottom: '8px' }}>Select Participating Teams/Members *</label>
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '12px',
                  background: 'var(--input-bg)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  {filteredDepartments.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No departments registered for this sport.</span>}
                  {filteredDepartments.map(team => (
                    <label key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '14px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.participatingTeamIds.includes(team.id)}
                        onChange={() => handleParticipantToggle(team.id)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      {team.name}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Select all the teams that will be participating in this event (e.g., running in this heat).</p>
              </div>
            )
          )}

          <div className="form-group full-width">
            <label className="form-label">Match/Event Date and Time *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="date" 
                className="form-input" 
                value={formData.matchDateTime ? formData.matchDateTime.split('T')[0] : ''}
                onChange={(e) => handleDateTimeChange('matchDateTime', 'date', e.target.value)}
                min={activeEvent && activeEvent.startDate ? toLocalDatetimeLocal(activeEvent.startDate, false).split('T')[0] : undefined}
                max={activeEvent && activeEvent.endDate ? toLocalDatetimeLocal(activeEvent.endDate, true).split('T')[0] : undefined}
                required 
              />
              <input 
                type="time" 
                className="form-input" 
                value={formData.matchDateTime && formData.matchDateTime.includes('T') ? formData.matchDateTime.split('T')[1] : ''}
                onChange={(e) => handleDateTimeChange('matchDateTime', 'time', e.target.value)}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ flex: 1, background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', marginTop: 0 }}
              onClick={(e) => handleSubmit(e, 'add_another')}
            >
              Schedule & Add Another
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1, marginTop: 0 }}
            >
              Schedule Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchSchedule;
