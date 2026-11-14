import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SyncProvider } from './context/SyncContext';
import { EvidenceProvider } from './context/EvidenceContext';

import Sidebar from './components/Sidebar';
import SyncStatusBar from './components/SyncStatusBar';
import EvidenceDrawer from './components/EvidenceDrawer';
import AddAccountModal from './components/AddAccountModal';
import CreateTaskModal from './components/CreateTaskModal';

import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailPage from './pages/AccountDetailPage';
import InteractionTimelinePage from './pages/InteractionTimelinePage';
import PriorityTasksPage from './pages/PriorityTasksPage';
import CustomerSentimentPage from './pages/CustomerSentimentPage';
import DealsPage from './pages/DealsPage';
import PowerMapPage from './pages/PowerMapPage';
import NextActionsPage from './pages/NextActionsPage';
import RiskRadarPage from './pages/RiskRadarPage';
import BlindSpotsPage from './pages/BlindSpotsPage';
import EvidencePage from './pages/EvidencePage';
import ActivityPage from './pages/ActivityPage';
import NotesPage from './pages/NotesPage';
import HandInPage from './pages/HandInPage';

export function AppContent() {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Sleek Vertical Sidebar Navigation */}
      <Sidebar
        onOpenAddAccount={() => setIsAddAccountOpen(true)}
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-slate-950">
        {/* Top Sync & Provenance Bar */}
        <SyncStatusBar />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
              <Route path="/timeline" element={<InteractionTimelinePage onOpenCreateTask={() => setIsCreateTaskOpen(true)} />} />
              <Route path="/tasks" element={<PriorityTasksPage />} />
              <Route path="/sentiment" element={<CustomerSentimentPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/power-map" element={<PowerMapPage />} />
              <Route path="/actions" element={<NextActionsPage />} />
              <Route path="/risks" element={<RiskRadarPage />} />
              <Route path="/blind-spots" element={<BlindSpotsPage />} />
              <Route path="/evidence" element={<EvidencePage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/hand-in" element={<HandInPage />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <EvidenceDrawer />
      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <Router>
      <SyncProvider>
        <EvidenceProvider>
          <AppContent />
        </EvidenceProvider>
      </SyncProvider>
    </Router>
  );
}

export default App;
