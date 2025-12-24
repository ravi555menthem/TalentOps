import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import Layout from '../executive/components/Layout/Layout';
// @ts-ignore
import DashboardHome from '../executive/pages/DashboardHome';
// @ts-ignore
import ModulePage from '../executive/pages/ModulePage';
// @ts-ignore
import { ToastProvider } from '../executive/context/ToastContext';
// @ts-ignore
import { UserProvider } from '../executive/context/UserContext';

// @ts-ignore
import { ATSDataProvider } from '../executive/context/ATSDataContext';
// @ts-ignore
import HiringPortal from '../executive/pages/HiringPortal/HiringPortal';
import '../executive/index.css';

export const ExecutiveDashboard = () => {
    return (

        <UserProvider>
            <ToastProvider>
                <ATSDataProvider>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="analytics" element={<ModulePage title="Analytics" type="analytics" />} />
                            <Route path="employees" element={<ModulePage title="Employees" type="workforce" />} />
                            <Route path="tasks" element={<ModulePage title="Task Executive" type="tasks" />} />
                            <Route path="leaves" element={<ModulePage title="Leave Requests" type="leaves" />} />
                            <Route path="employee-status" element={<ModulePage title="Employee Status" type="status" />} />
                            <Route path="payslips" element={<ModulePage title="Payslips" type="payroll" />} />
                            <Route path="policies" element={<ModulePage title="Policies" type="policies" />} />
                            <Route path="payroll" element={<ModulePage title="Payroll" type="payroll-generation" />} />
                            <Route path="invoice" element={<ModulePage title="Invoice" type="invoice" />} />
                            <Route path="hiring" element={<HiringPortal />} />
                            <Route path="hierarchy" element={<ModulePage title="Organizational Hierarchy" type="default" />} />
                            <Route path="project-hierarchy" element={<ModulePage title="Project Hierarchy" type="default" />} />
                            <Route path="announcements" element={<ModulePage title="Announcements" type="default" />} />
                            <Route path="settings" element={<ModulePage title="Settings" type="default" />} />
                        </Routes>
                    </Layout>
                </ATSDataProvider>
            </ToastProvider>
        </UserProvider>

    );
};
