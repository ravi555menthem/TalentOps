import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import Layout from '../employee/components/Layout/Layout';
// @ts-ignore
import DashboardHome from '../employee/pages/DashboardHome';
// @ts-ignore
import ModulePage from '../employee/pages/ModulePage';
// @ts-ignore
import { ToastProvider } from '../employee/context/ToastContext';
// @ts-ignore
import { UserProvider } from '../employee/context/UserContext';
import '../employee/index.css';

export const EmployeeDashboard = () => {
    return (
        <UserProvider>
            <ToastProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="analytics" element={<ModulePage title="My Analytics" type="analytics" />} />
                        <Route path="employees" element={<ModulePage title="Team Members" type="workforce" />} />
                        <Route path="tasks" element={<ModulePage title="Your Tasks" type="tasks" />} />
                        <Route path="leaves" element={<ModulePage title="Leave Requests" type="leaves" />} />
                        <Route path="team-status" element={<ModulePage title="Your Status" type="status" />} />
                        <Route path="payslips" element={<ModulePage title="Your Payslip" type="payroll" />} />
                        <Route path="policies" element={<ModulePage title="Policies" type="policies" />} />
                        <Route path="hierarchy" element={<ModulePage title="Organizational Hierarchy" type="default" />} />
                        <Route path="project-hierarchy" element={<ModulePage title="Project Hierarchy" type="default" />} />
                        <Route path="announcements" element={<ModulePage title="Announcements" type="default" />} />
                        <Route path="settings" element={<ModulePage title="Settings" type="default" />} />
                    </Routes>
                </Layout>
            </ToastProvider>
        </UserProvider>
    );
};
