import { useSyncExternalStore } from 'react';
import { getPendingRequests, subscribeToRequests } from '../utils/request';
import './LoadingIndicator.css';

export default function LoadingIndicator() {
  const pending = useSyncExternalStore(subscribeToRequests, getPendingRequests);
  if (!pending) return null;
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label="Loading">
      <span className="loading-spinner" aria-hidden="true" />
    </div>
  );
}
