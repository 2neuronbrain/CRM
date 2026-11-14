import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SyncProvider } from './context/SyncContext';
import { EvidenceProvider } from './context/EvidenceContext';
import Navbar from './components/Navbar';
import SyncStatusBar from './components/SyncStatusBar';
import EvidenceDrawer from './components/EvidenceDrawer';

import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailPage from './pages/AccountDetailPage';
import DealsPage from './pages/DealsPage';
import PowerMapPage from './pages/PowerMapPage';
import NextActionsPage from './pages/NextActionsPage';
import RiskRadarPage from './pages/RiskRadarPage';
import BlindSpotsPage from './pages/BlindSpotsPage';
import EvidencePage from './pages/EvidencePage';
import ActivityPage from './pages/ActivityPage';
import NotesPage from './pages/NotesPage';
import HandInPage from './pages/HandInPage';

export function App() {
  return (
    <Router>
      <SyncProvider>
        <EvidenceProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
            <Navbar />
            <SyncStatusBar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
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
            </main>

            <EvidenceDrawer />

            <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>FlytBase CRM • Live MCP-Connected Account Intelligence</span>
                <span className="font-mono text-[11px] text-slate-400">Strict Provenance Architecture • 1 Call/65s Rate Limit</span>
              </div>
            </footer>
          </div>
        </EvidenceProvider>
      </SyncProvider>
    </Router>
  );
}

export default App;
