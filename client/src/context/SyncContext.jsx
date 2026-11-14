import React, { createContext, useContext, useState, useEffect } from 'react';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const [syncStatus, setSyncStatus] = useState({
    syncState: 'idle',
    lastRequestAt: null,
    lastSuccessfulSyncAt: null,
    nextAllowedRequestAt: null,
    cooldownRemainingSeconds: 0,
    lastError: null,
    counts: { pending: 0, processing: 0, completed: 0, failed: 0 },
    recentQueue: [],
    isProcessing: false
  });
  const [liveEvents, setLiveEvents] = useState([]);

  // Fetch status polling
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/sync/status');
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch sync status:', err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    // Setup SSE
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');
      
      eventSource.addEventListener('operation_started', (e) => {
        const data = JSON.parse(e.data);
        fetchStatus();
      });

      eventSource.addEventListener('operation_completed', (e) => {
        const data = JSON.parse(e.data);
        fetchStatus();
      });

      eventSource.addEventListener('operation_failed', (e) => {
        const data = JSON.parse(e.data);
        fetchStatus();
      });

      eventSource.addEventListener('signals_processed', (e) => {
        const data = JSON.parse(e.data);
        setLiveEvents((prev) => [...data.events, ...prev]);
        fetchStatus();
      });

      eventSource.addEventListener('accounts_updated', () => fetchStatus());
      eventSource.addEventListener('paperwork_updated', () => fetchStatus());
      eventSource.addEventListener('queue_updated', () => fetchStatus());
      eventSource.addEventListener('note_created', () => fetchStatus());
    } catch (err) {
      console.warn('SSE connection failed:', err);
    }

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const triggerCheck = async () => {
    try {
      await fetch('/api/sync/check', { method: 'POST' });
      fetchStatus();
    } catch (err) {
      console.error('Trigger sync error:', err);
    }
  };

  const triggerInitialSync = async () => {
    try {
      await fetch('/api/sync/initial', { method: 'POST' });
      fetchStatus();
    } catch (err) {
      console.error('Trigger initial sync error:', err);
    }
  };

  return (
    <SyncContext.Provider value={{ syncStatus, liveEvents, triggerCheck, triggerInitialSync, refreshStatus: fetchStatus }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
