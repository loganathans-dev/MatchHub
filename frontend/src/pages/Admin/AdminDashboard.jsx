import { request } from '../../utils/request';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
export default function AdminDashboard() {
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => {
    request(`${import.meta.env.VITE_API_URL || ''}/api/admin/colleges`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message); setColleges(data); })
      .catch(error => setError(error.message)).finally(() => setLoading(false));
  }, []);
  return <main className="admin-dashboard-container">
    <h1>Registered colleges</h1>
    <p>Read-only directory. Approval and venue management are not implemented.</p>
    <Link to="/admin/signin" onClick={() => localStorage.removeItem('adminToken')}>Sign out</Link>
    <label htmlFor="college-search">Search colleges</label>
    <input id="college-search" className="admin-filter-input" value={query} onChange={e => setQuery(e.target.value)} />
    {error && <p role="alert">{error}</p>}
    {loading ? null : <div className="college-grid">
      {colleges.filter(c => `${c.collegeName} ${c.collegeCode}`.toLowerCase().includes(query.toLowerCase())).map(c => <article className="college-card" key={c._id}>
        <h2>{c.collegeName}</h2><p>{c.collegeCode} · {c.collegeType}</p><p>{c.city}, {c.state}</p>
      </article>)}
      {!colleges.length && !error && <p>No registered colleges.</p>}
    </div>}
  </main>;
}
