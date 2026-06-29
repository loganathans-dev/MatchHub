import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Auth.css';

const MatchResult = () => {
  const location = useLocation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState(location.state?.matchId || '');
  
  // State for Team Matches
  const [teamScores, setTeamScores] = useState({ teamA: '', teamB: '' });
  const [winnerId, setWinnerId] = useState('');
  
  // State for Multi-participant Events (Rank wise)
  const [ranks, setRanks] = useState({ rank1: '', rank2: '', rank3: '' });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/matches', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Map _id to id for compatibility with existing code
          const formatted = data.map(m => ({ ...m, id: m._id, title: m.sportName + ' - ' + (m.type === 'team' ? `${m.teamA?.name} vs ${m.teamB?.name}` : 'Multi-Participant') }));
          setMatches(formatted);
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  const handleMatchChange = (e) => {
    setSelectedMatchId(e.target.value);
    setError('');
    // Reset form states
    setTeamScores({ teamA: '', teamB: '' });
    setWinnerId('');
    setRanks({ rank1: '', rank2: '', rank3: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedMatch) {
      setError('Please select a match first.');
      return;
    }

    let payload = {
      match_id: selectedMatch.id,
      match_type: selectedMatch.type
    };

    if (selectedMatch.type === 'team') {
      if (!winnerId) {
        setError('Please declare a winner or outcome.');
        return;
      }
      payload = {
        ...payload,
        score_team_a: teamScores.teamA,
        score_team_b: teamScores.teamB,
        winner_id: winnerId,
        runner_id: winnerId === selectedMatch.teamA.id ? selectedMatch.teamB.id : 
                   (winnerId === selectedMatch.teamB.id ? selectedMatch.teamA.id : null)
      };
    } else {
      if (!ranks.rank1 || !ranks.rank2) {
        setError('Please declare at least Rank 1 (Winner) and Rank 2 (Runner).');
        return;
      }
      // Ensure ranks are unique
      const selectedRanks = [ranks.rank1, ranks.rank2, ranks.rank3].filter(r => r);
      const uniqueRanks = new Set(selectedRanks);
      if (uniqueRanks.size !== selectedRanks.length) {
        setError('A team cannot hold multiple ranks. Please select unique teams for each rank.');
        return;
      }

      payload = {
        ...payload,
        rank_1_id: ranks.rank1,
        rank_2_id: ranks.rank2,
        rank_3_id: ranks.rank3 || null // Optional 3rd place
      };
    }

    console.log('Submitting Match Result:', payload);
    
    try {
      const token = localStorage.getItem('token');
      const response =  fetch(`/api/matches/${selectedMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Completed',
          winner: payload.winner_id || payload.rank_1_id,
          score: payload.score_team_a ? `${payload.score_team_a} - ${payload.score_team_b}` : 'Ranked'
        })
      });
      if (response.ok) {
        alert('Match Result Updated Successfully!');
        navigate(-1);
      } else {
        setError('Failed to update result');
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
        <div className="auth-header">
          <h1 className="auth-title">Update Match Results</h1>
          <p className="auth-subtitle">Record scores and declare winners/runners for scheduled events</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group full-width">
            <label className="form-label">Select Match/Event *</label>
            <select 
              className="form-input" 
              value={selectedMatchId}
              onChange={handleMatchChange}
              required
            >
              <option value="" disabled>Choose a match to update...</option>
              {matches.map(match => (
                <option key={match.id} value={match.id}>{match.title}</option>
              ))}
            </select>
          </div>

          {selectedMatch && selectedMatch.type === 'team' && (
            <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '16px' }}>Score Entry</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{selectedMatch.teamA.name} Score</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 2, 150/4"
                    value={teamScores.teamA}
                    onChange={(e) => setTeamScores({...teamScores, teamA: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{selectedMatch.teamB.name} Score</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 1, 148/8"
                    value={teamScores.teamB}
                    onChange={(e) => setTeamScores({...teamScores, teamB: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group full-width" style={{ marginTop: '16px' }}>
                <label className="form-label">Declare Winner *</label>
                <select 
                  className="form-input" 
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select the winning team...</option>
                  <option value={selectedMatch.teamA.id}>{selectedMatch.teamA.name} (Winner)</option>
                  <option value={selectedMatch.teamB.id}>{selectedMatch.teamB.name} (Winner)</option>
                  <option value="draw">Match Drawn / Tie</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>The other team will automatically be marked as Runner-up.</p>
              </div>
            </div>
          )}

          {selectedMatch && selectedMatch.type !== 'team' && (
            <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '16px' }}>Rank Wise Declaration</h3>
              
              <div className="form-group full-width">
                <label className="form-label" style={{ color: 'gold' }}>1st Place (Winner) *</label>
                <select 
                  className="form-input" 
                  value={ranks.rank1}
                  onChange={(e) => setRanks({...ranks, rank1: e.target.value})}
                  required
                >
                  <option value="" disabled>Select Rank 1</option>
                  {selectedMatch.participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label" style={{ color: 'silver' }}>2nd Place (Runner) *</label>
                <select 
                  className="form-input" 
                  value={ranks.rank2}
                  onChange={(e) => setRanks({...ranks, rank2: e.target.value})}
                  required
                >
                  <option value="" disabled>Select Rank 2</option>
                  {selectedMatch.participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label" style={{ color: '#cd7f32' }}>3rd Place (Optional)</label>
                <select 
                  className="form-input" 
                  value={ranks.rank3}
                  onChange={(e) => setRanks({...ranks, rank3: e.target.value})}
                >
                  <option value="">None / Not Applicable</option>
                  {selectedMatch.participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={!selectedMatch}>
            Update Result & Declare
          </button>
        </form>
      </div>
    </div>
  );
};

export default MatchResult;
