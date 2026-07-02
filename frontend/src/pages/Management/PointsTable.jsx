import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Auth.css';
import { AVAILABLE_SPORTS } from '../../utils/constants';

// Calculate actual points based on matches, aggregating by department name to prevent duplicates
const calculatePoints = (departments, matches, sportNameFilter = null) => {
  const idToNormName = {};
  const deptPoints = departments.reduce((acc, dept) => {
    const normName = dept.name.trim().toLowerCase();
    idToNormName[dept._id] = normName;
    
    // Group departments with same name (ignoring case)
    if (!acc[normName]) {
      acc[normName] = { ...dept, name: dept.name.trim(), totalPoints: 0 };
    }
    return acc;
  }, {});

  matches.forEach(match => {
    if (match.status !== 'Completed') return;
    if (sportNameFilter && match.sportName !== sportNameFilter) return;

    if (match.type === 'team') {
      const winnerId = match.winner?._id || match.winner;
      let runnerId = null;
      
      const teamAId = match.teamA?._id || match.teamA;
      const teamBId = match.teamB?._id || match.teamB;

      if (winnerId === teamAId) runnerId = teamBId;
      else if (winnerId === teamBId) runnerId = teamAId;

      const winnerName = idToNormName[winnerId];
      const runnerName = idToNormName[runnerId];

      if (winnerName && deptPoints[winnerName]) {
        deptPoints[winnerName].totalPoints += 10;
      }
      
      if (runnerName && deptPoints[runnerName]) {
        deptPoints[runnerName].totalPoints += 5;
      }
    } else {
      // For multi-participant, assign 10, 5, 3 points for 1st, 2nd, 3rd places
      const winnerId = match.winner?._id || match.winner;
      const runnerId = match.runner?._id || match.runner;
      const thirdPlaceId = match.thirdPlace?._id || match.thirdPlace;
      
      const winnerName = idToNormName[winnerId];
      const runnerName = idToNormName[runnerId];
      const thirdPlaceName = idToNormName[thirdPlaceId];
      
      if (winnerName && deptPoints[winnerName]) {
        deptPoints[winnerName].totalPoints += 10;
      }
      if (runnerName && deptPoints[runnerName]) {
        deptPoints[runnerName].totalPoints += 5;
      }
      if (thirdPlaceName && deptPoints[thirdPlaceName]) {
        deptPoints[thirdPlaceName].totalPoints += 3;
      }
    }
  });

  return Object.values(deptPoints).sort((a, b) => b.totalPoints - a.totalPoints);
};

const PointsTable = () => {
  const location = useLocation();
  const eventId = location.state?.eventId;
  const [eventSports, setEventSports] = useState([]);
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' | 'sportswise'
  const [selectedSportId, setSelectedSportId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!eventId) {
      navigate('/management/event-list', { state: { action: 'points' } });
      return;
    }

    const fetchDepartmentsAndEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const [deptRes, eventRes, matchRes] = await Promise.all([
          fetch(`/api/departments${eventId ? `?eventId=${eventId}` : ''}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/matches${eventId ? `?eventId=${eventId}` : ''}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (deptRes.ok) {
          const data = await deptRes.json();
          setDepartments(data);
        }
        
        if (matchRes.ok) {
          const data = await matchRes.json();
          setMatches(data);
        }

        if (eventRes.ok && eventId) {
          const data = await eventRes.json();
          const activeEvent = data.find(e => e._id === eventId);
          if (activeEvent && activeEvent.sportsList) {
            const mappedSports = activeEvent.sportsList.map(sportName => {
              const found = AVAILABLE_SPORTS.find(s => s.name === sportName);
              return found || { id: sportName, name: sportName };
            });
            setEventSports(mappedSports);
            if (mappedSports.length > 0) {
              setSelectedSportId(mappedSports[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentsAndEvents();
  }, []);

  const OVERALL_POINTS = React.useMemo(() => calculatePoints(departments, matches), [departments, matches]);
  
  const currentSportPoints = React.useMemo(() => {
    const sportName = eventSports.find(s => s.id === selectedSportId)?.name;
    const ranked = calculatePoints(departments, matches, sportName);
    return ranked.map((dept, idx) => ({ ...dept, points: dept.totalPoints, rank: idx + 1 }));
  }, [departments, matches, selectedSportId, eventSports]);

  return (
    <div className="auth-container" style={{ padding: '40px 20px', minHeight: '100vh', alignItems: 'flex-start' }}>
      <div className="auth-card wide" style={{ maxWidth: '900px', width: '100%' }}>
        <Link to="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-link" style={{ display: 'flex', width: 'fit-content', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div className="auth-header" style={{ marginBottom: '24px' }}>
          <h1 className="auth-title" style={{ textAlign: 'center' }}>Points Table Dashboard</h1>
          <p className="auth-subtitle" style={{ textAlign: 'center' }}>Track departmental standings across all sports</p>
        </div>

        {/* View Toggle Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', background: 'var(--bg-dark)', padding: '6px', borderRadius: '12px' }}>
          <button 
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              background: activeTab === 'overall' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'overall' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('overall')}
          >
            Overall Championship Table
          </button>
          <button 
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              background: activeTab === 'sportswise' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'sportswise' ? '#fff' : 'var(--text-muted)'
            }}
            onClick={() => setActiveTab('sportswise')}
          >
            Sports-wise Points Table
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading standings...</div>
        ) : (
          <>
        {/* Tab 1: Overall Points */}
        {activeTab === 'overall' && (
          <div className="table-responsive-wrapper" style={{ background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-dark)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-main)' }}>Rank</th>
                  <th style={{ padding: '16px', color: 'var(--text-main)' }}>Department / Team</th>
                  <th style={{ padding: '16px', color: 'var(--primary-color)', textAlign: 'right' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {OVERALL_POINTS.map((team, index) => (
                  <tr key={team.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-dark)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--text-muted)' }}>
                      #{index + 1}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>{team.name}</td>
                    <td style={{ padding: '16px', color: 'var(--primary-color)', fontWeight: 'bold', textAlign: 'right', fontSize: '18px' }}>{team.totalPoints} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Sports-wise Points */}
        {activeTab === 'sportswise' && (
          <div>
            <div className="form-group full-width" style={{ marginBottom: '24px' }}>
              <label className="form-label">Select Sport to view standings</label>
              <select 
                className="form-input" 
                value={selectedSportId}
                onChange={(e) => setSelectedSportId(e.target.value)}
              >
                {eventSports.map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </select>
            </div>

            <div className="table-responsive-wrapper" style={{ background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-dark)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '16px', color: 'var(--text-main)', width: '100px' }}>Rank</th>
                    <th style={{ padding: '16px', color: 'var(--text-main)' }}>Department / Team</th>
                    <th style={{ padding: '16px', color: 'var(--primary-color)', textAlign: 'right' }}>Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSportPoints.length > 0 ? (
                    currentSportPoints.map((team, index) => (
                      <tr key={team.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-dark)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding: '16px', fontWeight: 'bold', color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--text-muted)' }}>
                          #{team.rank}
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>{team.name}</td>
                        <td style={{ padding: '16px', color: 'var(--primary-color)', fontWeight: 'bold', textAlign: 'right' }}>
                          {team.points > 0 ? `+${team.points} pts` : '0 pts'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No results published for this sport yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </>
        )}

      </div>
    </div>
  );
};

export default PointsTable;
