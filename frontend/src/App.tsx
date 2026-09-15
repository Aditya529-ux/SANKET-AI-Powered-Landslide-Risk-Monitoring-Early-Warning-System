import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import RiskMapPage from './pages/RiskMapPage';
import AIAnalysis from './pages/AIAnalysis';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import HistoricalAnalysis from './pages/HistoricalAnalysis';
import Reports from './pages/Reports';
import Team from './pages/Team';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-sanket-bg">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/map" element={<RiskMapPage />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/historical" element={<HistoricalAnalysis />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
