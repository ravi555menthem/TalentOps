import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import Layout from '../manager/components/Layout/Layout';
// @ts-ignore
import DashboardHome from '../manager/pages/DashboardHome';
// @ts-ignore
import ModulePage from '../manager/pages/ModulePage';
// @ts-ignore
import MyLeavesPage from '../manager/pages/MyLeavesPage';
// @ts-ignore
import { ToastProvider } from '../manager/context/ToastContext';
// @ts-ignore
import { UserProvider } from '../manager/context/UserContext';
import '../manager/index.css';

export const ManagerDashboard = () => {
    return (
        <UserProvider>
            <ToastProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="analytics" element={<ModulePage title="Analytics" type="analytics" />} />
                        <Route path="employees" element={<ModulePage title="Employees" type="workforce" />} />
                        <Route path="tasks" element={<ModulePage title="Task Manager" type="tasks" />} />
                        <Route path="leaves" element={<ModulePage title="Leave Requests" type="leaves" />} />
                        <Route path="my-leaves" element={<MyLeavesPage />} />
                        <Route path="employee-status" element={<ModulePage title="Employee Status" type="status" />} />
                        <Route path="payslips" element={<ModulePage title="Payslips" type="payroll" />} />
                        <Route path="policies" element={<ModulePage title="Policies" type="policies" />} />
                        <Route path="payroll" element={<ModulePage title="Payroll" type="payroll-generation" />} />
                        <Route path="hiring" element={<ModulePage title="Hiring Portal" type="recruitment" />} />
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
