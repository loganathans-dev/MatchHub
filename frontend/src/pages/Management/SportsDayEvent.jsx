import { request } from '../../utils/request';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Auth.css';
import { AVAILABLE_SPORTS } from '../../utils/constants';

const SportsDayEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    information: '',
    sportsIds: []
  });

  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle clicking outside the custom dropdown to close it
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (field, type, value) => {
    setFormData(prev => {
      const currentVal = prev[field] || '';
      let datePart;
      let timePart = '';

      if (currentVal.includes('T')) {
        [datePart, timePart] = currentVal.split('T');
      } else {
        datePart = currentVal;
      }

      if (type === 'date') {
        datePart = value;
        if (datePart && !timePart) {
          timePart = field === 'startDate' ? '09:00' : '17:00';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.startDate || !formData.endDate || formData.sportsIds.length === 0 || !formData.information) {
      setError('Please fill in all fields and select at least one sport.');
      return;
    }

    if (!formData.startDate.includes('T') || !formData.startDate.split('T')[0] || !formData.startDate.split('T')[1] ||
        !formData.endDate.includes('T') || !formData.endDate.split('T')[0] || !formData.endDate.split('T')[1]) {
      setError('Please provide both valid date and time for start and end.');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date/time must be after the start date/time.');
      return;
    }

    const sportsNames = formData.sportsIds.map(id => {
      const sport = AVAILABLE_SPORTS.find(s => s.id === id);
      return sport ? sport.name : id;
    });

    const payload = {
      title: formData.title,
      eventTitle: formData.title,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      sportsList: sportsNames,
      description: formData.information
    };

    try {
      const token = localStorage.getItem('token');
      const response = await request(`${import.meta.env.VITE_API_URL || ""}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const responseData = await response.json();
        alert('Sports Day Event Details Saved Successfully!');
        navigate('/management/department-registration', { state: { eventId: responseData._id } });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save event details');
      }
    } catch (err) {
      console.error('Failed to submit event', err);
      setError('Server connection error. Please try again.');
    }
  };

  // Filter out already selected sports, then filter by search query
  const filteredSports = AVAILABLE_SPORTS
    .filter(sport => !formData.sportsIds.includes(sport.id))
    .filter(sport => sport.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="auth-container" style={{ padding: '40px 20px' }}>
      <div className="auth-card wide">
        <Link to="/management/home" className="auth-link" style={{ display: 'flex', width: 'fit-content', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div className="auth-header">
          <h1 className="auth-title">Sports Day Event Details</h1>
          <p className="auth-subtitle">Configure the date, time, and available sports for your college event</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group full-width">
            <label className="form-label" htmlFor="sportsdayevent-field-1">Event Name *</label>
            <input id="sportsdayevent-field-1"
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Annual Sports Day 2026"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Event Start Date & Time *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                  onChange={(e) => handleDateTimeChange('startDate', 'date', e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="form-input"
                  value={formData.startDate && formData.startDate.includes('T') ? formData.startDate.split('T')[1] : ''}
                  onChange={(e) => handleDateTimeChange('startDate', 'time', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Event End Date & Time *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                  onChange={(e) => handleDateTimeChange('endDate', 'date', e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="form-input"
                  value={formData.endDate && formData.endDate.includes('T') ? formData.endDate.split('T')[1] : ''}
                  onChange={(e) => handleDateTimeChange('endDate', 'time', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group full-width" style={{ position: 'relative' }} ref={dropdownRef}>
            <label className="form-label" style={{ marginBottom: '8px' }} htmlFor="sportsdayevent-field-2">Search and Add Sports *</label>

            <input id="sportsdayevent-field-2"
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
                maxWidth: '400px', /* Only reduce the dropdown list width */
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
                maxWidth: '400px', /* Only reduce the dropdown list width */
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
                  const sport = AVAILABLE_SPORTS.find(s => s.id === sportId);
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
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Click on the input to search. Uncheck a selected sport below to remove it.</p>
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="sportsdayevent-field-3">General Information / Rules *</label>
            <textarea id="sportsdayevent-field-3"
              name="information"
              className="form-input"
              rows="5"
              placeholder="Enter general rules, venue details, or any other important information..."
              value={formData.information}
              onChange={handleInputChange}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default SportsDayEvent;
