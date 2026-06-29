import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Auth.css';
import { AVAILABLE_SPORTS } from '../../utils/constants';

// Helper to generate mock points for an array of departments
const generateOverallPoints = (departments) => {
  return departments.map((team) => ({
    ...team,
    totalPoints: Math.floor(Math.random() * 30) + 10,
    gold: Math.floor(Math.random() * 3),
    silver: Math.floor(Math.random() * 4),
    bronze: Math.floor(Math.random() * 5),
  })).sort((a, b) => b.totalPoints - a.totalPoints);
};

// Mock Points Data for Sports-wise Table
const generateSportsPoints = (departments, sportId) => {
  if (!departments || departments.length === 0) return [];
  const shuffled = [...departments].sort(() => 0.5 - Math.random());
  const participants = shuffled.slice(0, Math.min(4, departments.length)); 
  
  return participants.map((team, index) => {
    let points = 0;
    if (index === 0) points = 10;
    else if (index === 1) points = 5;
    else if (index === 2) points = 2;

    return { ...team, points, rank: index + 1 };
  }).sort((a, b) => b.points - a.points);
};

const PointsTable = () => {
  const location = useLocation();
  const eventId = location.state?.eventId;
  const [eventSports, setEventSports] = useState([]);
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' | 'sportswise'
  const [selectedSportId, setSelectedSportId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartmentsAndEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const [deptRes, eventRes] = await Promise.all([
          fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (deptRes.ok) {
          const data = await deptRes.json();
          setDepartments(data);
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

  const OVERALL_POINTS = React.useMemo(() => generateOverallPoints(departments), [departments]);
  const currentSportPoints = React.useMemo(() => generateSportsPoints(departments, selectedSportId), [departments, selectedSportId]);

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
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-dark)', padding: '6px', borderRadius: '12px' }}>
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
                  <th style={{ padding: '16px', color: 'gold', textAlign: 'center' }}>🥇 Gold</th>
                  <th style={{ padding: '16px', color: 'silver', textAlign: 'center' }}>🥈 Silver</th>
                  <th style={{ padding: '16px', color: '#cd7f32', textAlign: 'center' }}>🥉 Bronze</th>
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
                    <td style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>{team.gold}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>{team.silver}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>{team.bronze}</td>
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
