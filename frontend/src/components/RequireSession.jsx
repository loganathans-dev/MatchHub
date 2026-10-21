import { useState } from 'react';
import { Navigate } from 'react-router-dom';
export default function RequireSession({ admin = false, children }) {
  const [now] = useState(() => Date.now());
  const token = localStorage.getItem(admin ? 'adminToken' : 'token');
  let valid = false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    valid = payload.exp * 1000 > now && payload.role === (admin ? 'admin' : 'college');
  } catch { /* Missing or malformed session. API remains the authorization authority. */ }
  return valid ? children : <Navigate to={admin ? '/admin/signin' : '/management/signin'} replace />;
}
