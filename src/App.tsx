import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import ClientPage from './pages/ClientPage';
import StaffMemberPage from './pages/StaffMemberPage';
import Header from './components/Header';
import { StaffingProvider } from './context/StaffingContext';

function App() {
  return (
    <StaffingProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/client" element={<ClientPage />} />
            <Route path="/staff-member" element={<StaffMemberPage />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </StaffingProvider>
  );
}

export default App;
