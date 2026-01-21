import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Navigation from './components/Navigation';

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/add';

  return (
    <>
      <div style={{ flex: 1, paddingBottom: showNav ? '80px' : '0' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddExpense />} />
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
