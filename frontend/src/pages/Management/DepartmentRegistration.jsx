import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Auth.css';
import { AVAILABLE_SPORTS } from '../../utils/constants';

const DepartmentRegistration = () => {
  const [formData, setFormData] = useState({
    departmentName: '',
    sportsIds: []
  });
  
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;
  const [eventSports, setEventSports] = useState([]);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch event sports
  useEffect(() => {
    const fetchEventSports = async () => {
      if (!eventId) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const activeEvent = data.find(e => e._id === eventId);
          if (activeEvent && activeEvent.sportsList) {
            // Map sports names back to objects with ids
            const mappedSports = activeEvent.sportsList.map(sportName => {
              const found = AVAILABLE_SPORTS.find(s => s.name === sportName);
              return found || { id: sportName, name: sportName };
            });
            setEventSports(mappedSports);
          }
        }
      } catch (err) {
        console.error('Failed to fetch event details', err);
      }
    };
    fetchEventSports();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSportToggle = (sportId) => {
    setFormData(prev => {
      const currentSports = prev.sportsIds;
      if (currentSports.includes(sportId)) {
        return { ...prev, sportsIds: currentSports.filter(id => id !== sportId) };
      } else {
        return { ...prev, sportsIds: [...currentSports, sportId] };
      }
    });
  };

  const handleAddSport = (sportId) => {
    if (!formData.sportsIds.includes(sportId)) {
      setFormData(prev => ({ ...prev, sportsIds: [...prev.sportsIds, sportId] }));
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setError('');

    if (!formData.departmentName || formData.sportsIds.length === 0) {
      setError('Please enter a department name and select at least one sport.');
      return;
    }

    const payload = {
      name: formData.departmentName,
      registeredSports: formData.sportsIds,
      eventId: eventId
    };

    console.log(`Submitting Department Registration (${action}):`, payload);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (action === 'add_another') {
          alert(`Department ${formData.departmentName} Registered! You can now add another.`);
          setFormData({
            departmentName: '',
            sportsIds: []
          });
          setSearchQuery('');
        } else {
          alert(`Department ${formData.departmentName} Registered Successfully!`);
          navigate('/management/match-schedule', { state: { eventId } });
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to register department');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Server connection error. Please try again.');
    }
  };

  const filteredSports = eventSports
    .filter(sport => !formData.sportsIds.includes(sport.id))
    .filter(sport => sport.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="auth-container" style={{ padding: '40px 20px' }}>
      <div className="auth-card wide">
        <Link to="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-link" style={{ display: 'flex', width: 'fit-content', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div className="auth-header">
          <h1 className="auth-title">Department Registration</h1>
          <p className="auth-subtitle">Register a department and select the sports they will participate in</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group full-width">
            <label className="form-label">Department Name *</label>
            <input 
              type="text" 
              name="departmentName" 
              className="form-input" 
              placeholder="e.g. Computer Science (CSE)"
              value={formData.departmentName}
              onChange={handleInputChange}
              required 
            />
          </div>

          <div className="form-group full-width" style={{ position: 'relative' }} ref={dropdownRef}>
            <label className="form-label" style={{ marginBottom: '8px' }}>Participating Sports *</label>
            
            <input 
              type="text"
              className="form-input"
              placeholder="Type to search for a sport... (e.g. Cricket, 100m)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              style={{ marginBottom: '16px', width: '100%' }}
            />

            {isDropdownOpen && filteredSports.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '80px',
                left: 0,
                right: 0,
                maxWidth: '400px',
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                zIndex: 10,
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {filteredSports.map(sport => (
                  <div 
                    key={sport.id}
                    onClick={() => handleAddSport(sport.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--input-bg)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {sport.name}
                  </div>
                ))}
              </div>
            )}
            
            {isDropdownOpen && filteredSports.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '80px',
                left: 0,
                right: 0,
                maxWidth: '400px',
                padding: '12px 16px',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                zIndex: 10,
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}>
                No matching sports found.
              </div>
            )}

            {formData.sportsIds.length > 0 && (
              <div style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '12px',
                background: 'var(--input-bg)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginTop: '8px'
              }}>
                {formData.sportsIds.map(sportId => {
                  const sport = eventSports.find(s => s.id === sportId) || AVAILABLE_SPORTS.find(s => s.id === sportId);
                  return (
                    <label key={sportId} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '14px' }}>
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => handleSportToggle(sportId)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      {sport ? sport.name : 'Unknown Sport'}
                    </label>
                  );
                })}
              </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Search and add sports this department will participate in.</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ flex: 1, background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', marginTop: 0 }}
              onClick={(e) => handleSubmit(e, 'add_another')}
            >
              Save & Add Another
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ flex: 1, marginTop: 0 }}
              onClick={(e) => handleSubmit(e, 'save_and_redirect')}
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentRegistration;
