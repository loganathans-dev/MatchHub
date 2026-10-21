import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
export default function ApiNotice() {
  const [message, setMessage] = useState(null);
  const location = useLocation();
  useEffect(() => {
    const onError = event => setMessage({ text: event.detail, path: location.pathname });
    window.addEventListener('api-error', onError);
    return () => window.removeEventListener('api-error', onError);
  }, [location.pathname]);
  return message?.path === location.pathname && <div role="alert" style={{ position: 'sticky', top: 0, zIndex: 2000, padding: 16, color: '#fff', background: '#7f1d1d' }}>
    {message.text} <button type="button" onClick={() => setMessage(null)}>Dismiss</button>
  </div>;
}
