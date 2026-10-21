let pendingRequests = 0;
const listeners = new Set();
export const subscribeToRequests = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getPendingRequests = () => pendingRequests;
const updatePending = delta => {
  pendingRequests += delta;
  listeners.forEach(listener => listener());
};

export async function request(url, options) {
  updatePending(1);
  try {
    const response = await fetch(url, options);
    if (!response.ok && (!options?.method || options.method === 'GET')) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return response;
  } catch (error) {
    window.dispatchEvent(new CustomEvent('api-error', { detail: error.message || 'Unable to reach the server' }));
    throw error;
  } finally {
    updatePending(-1);
  }
}
