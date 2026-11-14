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
    isProcessing: false,
    pendingQueueCount: 0
  });
  const [secondsUntilAllowed, setSecondsUntilAllowed] = useState(0);
  const [isTriggeringSync, setIsTriggeringSync] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);

  // Fetch status polling
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/sync/status');
      if (res.ok) {
        const data = await res.json();
        const pendingQueueCount = data.pendingQueueCount !== undefined 
          ? data.pendingQueueCount 
          : (data.counts?.pending || 0);
        setSyncStatus({ ...data, pendingQueueCount });
      }
    } catch (err) {
      console.warn('Failed to fetch sync status:', err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);

    // Setup SSE
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');
      
      eventSource.addEventListener('operation_started', () => fetchStatus());
      eventSource.addEventListener('operation_completed', () => fetchStatus());
      eventSource.addEventListener('operation_failed', () => fetchStatus());
      eventSource.addEventListener('signals_processed', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.events) setLiveEvents((prev) => [...data.events, ...prev]);
        } catch (_) {}
        fetchStatus();
      });
      eventSource.addEventListener('task_created', () => fetchStatus());
      eventSource.addEventListener('task_updated', () => fetchStatus());
      eventSource.addEventListener('task_deleted', () => fetchStatus());
      eventSource.addEventListener('account_created', () => fetchStatus());
      eventSource.addEventListener('note_created', () => fetchStatus());
    } catch (err) {
      console.warn('SSE connection failed:', err);
    }

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  // Live countdown timer
  useEffect(() => {
    if (!syncStatus.nextAllowedRequestAt) {
      setSecondsUntilAllowed(0);
      return;
    }

    const target = new Date(syncStatus.nextAllowedRequestAt).getTime();
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setSecondsUntilAllowed(remaining);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [syncStatus.nextAllowedRequestAt]);

  const triggerCheck = async () => {
    setIsTriggeringSync(true);
    try {
      await fetch('/api/sync/check', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Trigger sync error:', err);
    } finally {
      setTimeout(() => setIsTriggeringSync(false), 800);
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
    <SyncContext.Provider value={{
      syncStatus,
      liveEvents,
      secondsUntilAllowed,
      isTriggeringSync,
      triggerCheck,
      triggerManualSync: triggerCheck,
      triggerInitialSync,
      refreshStatus: fetchStatus
    }}>
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

export default SyncContext;
