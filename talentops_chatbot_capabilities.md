# 🤖 TalentOps Chatbot: Capabilities & Role Guide

This document provides a complete overview of the functional actions available in the TalentOps Chatbot, categorized by user roles.

## 🔑 Role-Based Action Matrix

| Feature | Employee | Team Lead | Manager | Executive |
| :--- | :---: | :---: | :---: | :---: |
| **Attendance (Clock In/Out)** | ✅ | ✅ | ✅ | ✅ |
| **View Own Tasks/Leaves** | ✅ | ✅ | ✅ | ✅ |
| **Apply for Leave** | ✅ | ✅ | ✅ | ✅ |
| **View Team Attendance** | ❌ | ✅ | ✅ | ✅ |
| **View Team Tasks/Leaves** | ❌ | ✅ | ✅ | ✅ |
| **Approve/Reject Leaves** | ❌ | ⚠️ *Redirect* | ✅ | ✅ |
| **Assign Tasks** | ❌ | ❌ | ✅ | ✅ |
| **Manage Teams** | ❌ | ❌ | ✅ | ✅ |
| **Global Payroll Summary** | ❌ | ❌ | ❌ | ✅ |
| **System Announcements** | ❌ | ❌ | ❌ | ✅ |

## 🛠️ Detailed Action Library

### 1. Attendance & Timesheets
*   **Actions**: `clock_in`, `clock_out`, `get_attendance`, `view_team_attendance`.
*   **Sync**: Calculates "Total Hours" automatically.

### 2. Task Management
*   **Actions**: `create_task`, `view_my_tasks`, `view_team_tasks`.
*   **Intelligence**: Automatically resolves names to user IDs.

### 3. Leave Management
*   **Actions**: `apply_leave`, `manager_approve_leave`, `reject_leave`.
*   **Logic**: TLs are automatically redirected to Managers.

### 4. Announcements (Calendar Sync)
*   **Action**: `post_announcement`.
*   **Feature**: Announcements appear instantly in Dashboard Events & Calendar.

## 🚀 How to Test
1. Run **START_SERVERS.bat**.
2. Login to your dashboard.
3. Chat with the bot using natural language!
