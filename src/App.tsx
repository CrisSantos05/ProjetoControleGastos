import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import BudgetGoals from './pages/BudgetGoals';
import Settings from './pages/Settings';
import AddExpense from './pages/AddExpense';
import History from './pages/History';
import BillReminders from './pages/BillReminders';
import Navigation from './components/Navigation';

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/add';

  return (
    <>
      <div style={{ flex: 1, paddingBottom: showNav ? '80px' : '0' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/budget" element={<BudgetGoals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/history" element={<History />} />
          <Route path="/bills" element={<BillReminders />} />
        </Routes>
      </div>

      {showNav && <Navigation />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
