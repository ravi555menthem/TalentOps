import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardHome from './pages/DashboardHome';
import ModulePage from './pages/ModulePage';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/analytics" element={<ModulePage title="My Analytics" type="analytics" />} />
              <Route path="/employees" element={<ModulePage title="Team Members" type="workforce" />} />
              <Route path="/tasks" element={<ModulePage title="Your Tasks" type="tasks" />} />
              <Route path="/leaves" element={<ModulePage title="Leave Requests" type="leaves" />} />
              <Route path="/leaves" element={<ModulePage title="Leave Requests" type="leaves" />} />
              <Route path="/team-status" element={<ModulePage title="Your Status" type="status" />} />
              <Route path="/payslips" element={<ModulePage title="Your Payslip" type="payroll" />} />
              <Route path="/policies" element={<ModulePage title="Your Policies" type="policies" />} />

              <Route path="/hierarchy" element={<ModulePage title="Team Hierarchy" type="default" />} />
              <Route path="/audit" element={<ModulePage title="Audit Logs" type="default" />} />
              <Route path="/settings" element={<ModulePage title="Settings" type="default" />} />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </UserProvider>
  );
}

export default App;
