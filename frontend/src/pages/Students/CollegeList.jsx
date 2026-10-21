import { request } from '../../utils/request';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2 } from 'lucide-react';
import './StudentPortal.css';



const CollegeList = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await request(`${import.meta.env.VITE_API_URL || ""}/api/public/colleges`);
        if (response.ok) {
          setColleges(await response.json());
        }
      } catch (err) {
        console.error('Failed to fetch colleges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter(college =>
    (college.collegeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (college.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="student-portal-container">
      <header className="student-header" style={{ position: 'relative' }}>
        <button
          onClick={() => navigate('/management/signin')}
          className="admin-btn-primary"
          style={{ position: 'absolute', top: 0, right: 0, width: 'auto', padding: '8px 16px', fontSize: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          Management
        </button>
        <h1 className="student-title">Participating Colleges</h1>
        <p className="student-subtitle">Find your institution to view matches and results</p>
      </header>

      <div className="student-search-container">
        <Search className="student-search-icon" size={20} />
        <input
          type="text"
          className="student-search-input"
          placeholder="Search by college name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="student-college-grid">
        {loading ? (
          null
        ) : filteredColleges.map(college => (
          <div
            key={college._id}
            className="student-college-card"
            onClick={() => navigate(`/students/colleges/${college._id}`)}
            role="link" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") navigate(`/students/colleges/${college._id}`); }}
          >
            <div className="student-college-icon">
              <Building2 size={36} />
            </div>
            <h3 className="student-college-name">{college.collegeName}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <div className="student-college-meta">
                <MapPin size={14} />
                <span>{college.city}, {college.state}</span>
              </div>
              <div className="student-college-meta" style={{ justifyContent: 'center', marginTop: '0.25rem', color: '#38bdf8' }}>
                {college.collegeType}
              </div>
            </div>
          </div>
        ))}

        {!loading && filteredColleges.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
            No colleges found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeList;
