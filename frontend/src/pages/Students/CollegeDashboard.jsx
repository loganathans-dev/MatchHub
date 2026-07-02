import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Calendar, Trophy, Medal, Flag } from 'lucide-react';
import './StudentPortal.css';



const CollegeDashboard = () => {
  const { collegeId, eventId } = useParams();
  const [activeTab, setActiveTab] = useState('details'); // details, matches, results, points

  const [college, setCollege] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [colRes, deptRes, matchRes] = await Promise.all([
          fetch(`/api/public/colleges/${collegeId}`),
          fetch(`/api/public/colleges/${collegeId}/departments`),
          fetch(`/api/public/colleges/${collegeId}/matches`)
        ]);

        if (colRes.ok) setCollege(await colRes.json());
        if (deptRes.ok) setDepartments(await deptRes.json());
        if (matchRes.ok) setMatches(await matchRes.json());
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [collegeId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading College Dashboard...</div>;
  if (!college) return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>College not found.</div>;

  const scheduledMatches = matches.filter(m => m.status !== 'Completed');
  const results = matches.filter(m => m.status === 'Completed');

  // Compute Points
  const pointsMap = {};
  departments.forEach(d => {
    pointsMap[d.name] = { dept: d.name, gold: 0, silver: 0, bronze: 0, totalPoints: 0 };
  });

  const gameWiseResults = [];

  results.forEach(m => {
    if (m.winner) {
      const winnerName = m.winner.name;
      if (pointsMap[winnerName]) {
        pointsMap[winnerName].gold += 1;
        pointsMap[winnerName].totalPoints += 10;
      }
      gameWiseResults.push({
        sport: m.sportName,
        gold: winnerName,
        silver: m.type === 'team' ? (m.teamA.name === winnerName ? m.teamB?.name : m.teamA?.name) : '-',
        bronze: '-'
      });
    }
  });

  const pointsTable = Object.values(pointsMap)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((p, index) => ({ ...p, rank: index + 1 }));

  return (
    <div className="student-portal-container" style={{ paddingBottom: '4rem' }}>
      <div className="back-arrow-wrapper">
        <Link to={`/students/colleges/${collegeId}`} className="back-link" title="Back to Events">
          <ArrowLeft className="back-arrow-icon" strokeWidth={3} color="#fff" />
        </Link>
      </div>

      <div className="college-dashboard-container">
        
        {/* College Header */}
        <div className="college-header-card">
          <div className="student-college-icon" style={{ marginBottom: 0, width: '100px', height: '100px' }}>
            <Building2 size={48} />
          </div>
          <div className="college-header-info">
            <h1>{college.collegeName}</h1>
            <p><MapPin size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> {college.city}, {college.state} • {college.collegeCode}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <button className={`dashboard-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
            Overview Details
          </button>
          <button className={`dashboard-tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
            Scheduled Matches
          </button>
          <button className={`dashboard-tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
            Match Results
          </button>
          <button className={`dashboard-tab ${activeTab === 'points' ? 'active' : ''}`} onClick={() => setActiveTab('points')}>
            Points Table
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content-area">
          
          {/* 1. Details Tab */}
          {activeTab === 'details' && (
            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div>
                <h3 style={{ color: '#818cf8', marginBottom: '1rem' }}>Institution Address</h3>
                <p style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>{college.address}</p>
                <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0' }}>{college.city}, {college.state} - {college.pincode}</p>
                {college.location && <p style={{ color: '#38bdf8', fontSize: '0.875rem' }}><MapPin size={14} style={{display:'inline'}}/> Coordinates: {college.location}</p>}
              </div>
              <div>
                <h3 style={{ color: '#818cf8', marginBottom: '1rem' }}>Sports Coordinator</h3>
                <p style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>{college.coordinatorName}</p>
                <p style={{ color: '#94a3b8', margin: '0' }}>{college.coordinatorMobile}</p>
              </div>
              <div>
                <h3 style={{ color: '#818cf8', marginBottom: '1rem' }}>Participating Departments</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {departments.length > 0 ? departments.map(dept => (
                    <span key={dept._id} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.875rem' }}>{dept.name}</span>
                  )) : <span style={{ color: '#94a3b8' }}>No departments registered yet.</span>}
                </div>
              </div>
            </div>
          )}

          {/* 2. Matches Tab */}
          {activeTab === 'matches' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Upcoming Fixtures</h2>
              <div className="match-list">
                {scheduledMatches.length === 0 ? <p style={{ color: '#94a3b8' }}>No upcoming fixtures.</p> : scheduledMatches.map(match => (
                  <div key={match._id} className="match-card">
                    <div className="match-info">
                      <h3>{match.sportName} - {match.type === 'team' ? `${match.teamA?.name} vs ${match.teamB?.name}` : 'Multi-Participant'}</h3>
                      <div className="match-meta">
                        <span><Flag size={14}/> {match.event?.title}</span>
                      </div>
                    </div>
                    <div className="match-meta" style={{ gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                      <span><Calendar size={14} color="#38bdf8"/> {new Date(match.dateTime).toLocaleString()}</span>
                      <span><MapPin size={14} color="#38bdf8"/> College Ground</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Results Tab */}
          {activeTab === 'results' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Recent Match Results</h2>
              <div className="match-list">
                {results.length === 0 ? <p style={{ color: '#94a3b8' }}>No results published yet.</p> : results.map(result => (
                  <div key={result._id} className="match-card" style={{ borderLeft: '4px solid #38bdf8' }}>
                    <div className="match-info">
                      <h3>{result.sportName}</h3>
                      <div className="match-meta" style={{ color: '#38bdf8', fontWeight: 600, marginTop: '0.5rem' }}>
                        Winner: {result.winner ? result.winner.name : 'Unknown'}
                      </div>
                    </div>
                    <div className="match-score">
                      {result.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Points Table Tab */}
          {activeTab === 'points' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Department Leaderboard</h2>
              <div className="points-table-wrapper">
                <table className="points-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Department</th>
                      <th>Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointsTable.map(dept => (
                      <tr key={dept.dept}>
                        <td>
                          {dept.rank === 1 && dept.totalPoints > 0 ? <Trophy size={20} color="#fbbf24"/> : 
                           dept.rank === 2 && dept.totalPoints > 0 ? <Medal size={20} color="#94a3b8"/> : 
                           dept.rank === 3 && dept.totalPoints > 0 ? <Medal size={20} color="#b45309"/> : dept.rank}
                        </td>
                        <td className="dept-name">{dept.dept}</td>
                        <td className="points-value">{dept.totalPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>



              <h2 style={{ margin: '3rem 0 1.5rem 0', color: '#fff' }}>Game-wise Winners</h2>
              <div className="points-table-wrapper">
                <table className="points-table">
                  <thead>
                    <tr>
                      <th>Sport / Game</th>
                      <th style={{ color: '#fbbf24' }}>🥇 Winner</th>
                      <th style={{ color: '#94a3b8' }}>🥈 Runner-up</th>
                      <th style={{ color: '#b45309' }}>🥉 3rd Place</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameWiseResults.map((game, i) => (
                      <tr key={i}>
                        <td className="dept-name">{game.sport}</td>
                        <td>{game.gold}</td>
                        <td>{game.silver}</td>
                        <td>{game.bronze}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;
