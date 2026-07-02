import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, XCircle, X, Building, Phone, Mail, User } from 'lucide-react';
import './AdminDashboard.css';



const AdminDashboard = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/public/colleges`);
        if (response.ok) {
          const data = await response.json();
          // Add default status/location for UI purposes since backend might not have it yet
          const formatted = data.map(c => ({
            ...c,
            id: c._id,
            status: c.status || 'pending',
            location: c.location || ''
          }));
          setColleges(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch colleges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  // Filtering Logic
  const filteredColleges = colleges.filter(college => {
    const matchesSearch = (college.collegeName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (college.collegeCode || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || college.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (college) => {
    setSelectedCollege(college);
    setLocationInput(college.location || '');
  };

  const handleCloseModal = () => {
    setSelectedCollege(null);
    setLocationInput('');
  };

  const handleStatusChange = (id, newStatus) => {
    setColleges(prev => prev.map(col => col.id === id ? { ...col, status: newStatus } : col));
    setSelectedCollege(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleAddLocation = () => {
    if (!locationInput.trim()) return;
    setColleges(prev => prev.map(col => col.id === selectedCollege.id ? { ...col, location: locationInput } : col));
    setSelectedCollege(prev => ({ ...prev, location: locationInput }));
    alert('Location updated successfully!');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">College Registrations</h1>
        
        <div className="admin-filters">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search colleges..." 
              className="admin-filter-input"
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading colleges...</div>
      ) : (
      <div className="college-grid">
        {filteredColleges.map(college => (
          <div key={college.id} className="college-card" onClick={() => handleOpenModal(college)}>
            <div className="college-card-header">
              <div>
                <h3 className="college-name">{college.collegeName}</h3>
                <p className="college-code">{college.collegeCode} • {college.collegeType}</p>
              </div>
              <span className={`status-badge status-${college.status}`}>
                {college.status}
              </span>
            </div>
            
            <div className="college-info-row">
              <MapPin size={16} />
              <span>{college.city}, {college.state}</span>
            </div>
            <div className="college-info-row">
              <User size={16} />
              <span>{college.coordinatorName}</span>
            </div>
          </div>
        ))}
        {filteredColleges.length === 0 && (
          <p style={{ color: '#94a3b8' }}>No colleges found matching the criteria.</p>
        )}
      </div>
      )}

      {/* Detail Modal */}
      {selectedCollege && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="admin-dashboard-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {selectedCollege.collegeName}
                </h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className="college-code">{selectedCollege.collegeCode}</span>
                  <span className={`status-badge status-${selectedCollege.status}`}>
                    {selectedCollege.status}
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="details-section">
                  <h4><Building size={16} style={{ display: 'inline', marginRight: '8px' }} /> Institution Details</h4>
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{selectedCollege.collegeType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedCollege.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{selectedCollege.address}, {selectedCollege.city}, {selectedCollege.district}, {selectedCollege.state} - {selectedCollege.pincode}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h4><User size={16} style={{ display: 'inline', marginRight: '8px' }} /> Coordinator Details</h4>
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{selectedCollege.coordinatorName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile</span>
                    <span className="detail-value">{selectedCollege.coordinatorMobile}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedCollege.coordinatorEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions-container">
              <div className="location-action">
                <div className="location-input-group">
                  <label>Add / Update Location (Coordinates or Venue Name)</label>
                  <input 
                    type="text" 
                    className="admin-filter-input" 
                    style={{ width: '100%' }}
                    placeholder="e.g. 11.0168° N, 76.9558° E or Main Campus Ground"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                </div>
                <button className="btn-primary" onClick={handleAddLocation}>
                  <MapPin size={18} /> Save Location
                </button>
              </div>

              <div className="action-buttons">
                {selectedCollege.status !== 'approved' && (
                  <button className="btn-approve" onClick={() => handleStatusChange(selectedCollege.id, 'approved')}>
                    <CheckCircle size={18} /> Approve Registration
                  </button>
                )}
                {selectedCollege.status !== 'rejected' && (
                  <button className="btn-reject" onClick={() => handleStatusChange(selectedCollege.id, 'rejected')}>
                    <XCircle size={18} /> Reject Registration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
