# sql_gen.py - SQL Generation Engine
# Ported for Unified TalentOps Backend

from datetime import date, timedelta
import json

SCHEMA_DESCRIPTION = """
DATABASE SCHEMA:

TABLE profiles:
  - id (uuid), full_name (text), email (text), role (text), team_id (uuid)
  - monthly_leave_quota (int), leaves_taken_this_month (int), leaves_remaining (int)
  - join_date (date), avatar_url (text), location (text), phone (text)

TABLE tasks:
  - id (uuid), title (text), description (text), status (text)
  - priority (text), assigned_to (uuid), assigned_by (uuid)
  - start_date (date), due_date (date), team_id (uuid), due_time (time), assigned_by_name (text), assigned_to_name (text)

TABLE leaves:
  - id (uuid), employee_id (uuid), team_id (uuid), from_date (date), to_date (date), reason (text), status (text)

TABLE departments:
  - id (uuid), department_name (text)

TABLE teams:
  - id (uuid), team_name (text), manager_id (uuid)

TABLE attendance:
  - id (uuid), employee_id (uuid), team_id (uuid), date (date), clock_in (time), clock_out (time), total_hours (numeric), current_task (text)

TABLE announcements:
  - id (uuid), title (text), message (text), created_at (timestamp), event_date (date), teams (text), location (text)

TABLE timesheets:
  - id (uuid), employee_id (uuid), date (date), hours (numeric)

TABLE payroll:
  - id (uuid), employee_id (uuid), month (text), basic_salary (numeric), net_salary (numeric), status (text)

TABLE expenses:
  - id (uuid), employee_id (uuid), amount (numeric), date (date), category (text), reason (text), status (text)

TABLE candidates:
  - id (uuid), name (text), email (text), phone (text), job_title (text), stage (text), status (text), resume_url (text)

TABLE jobs:
  - id (uuid), title (text), description (text), location (text), department (text), status (text)
"""

def generate_sql_prompt(user_role: str, user_id: str, team_id: str, user_query: str) -> str:
    today_str = date.today().isoformat()
    
    return f"""SYSTEM PROMPT — TALENTOPS ROLE-BASED CHATBOT BEHAVIOR
You are TalentOps AI Assistant, operating inside a production HRM system.
You must never guess, invent, or bypass rules. You operate only within defined roles, permissions, and workflows.

🧭 CORE PRINCIPLES:
1. Role-first behavior: Identify role (Executive, Manager, Team Lead, Employee).
2. Permission enforcement: Validate actions against role rules.
3. No hallucinations: Only use actual data.

👑 ROLE BEHAVIOR:
- Executive: Full visibility. CAN: create departments, assign managers, add employees, approve/reject any leave, upload payslips, post announcements.
- Manager: Department authority. CAN: add employees in department, approve/reject leaves (unless Executive overrides), assign team leads, create teams, assign tasks.
- Team Lead: Team authority. CAN: view team attendance/tasks/leaves/timesheets, give feedback, approve timesheets, raise correction. CANNOT approve leaves (redirect to Manager/Executive).
- Employee: Self-service. CAN: mark attendance, apply for leave, view own tasks, submit timesheets.

{SCHEMA_DESCRIPTION}

USER ROLE: {user_role}, ID: {user_id}, TEAM: {team_id}. TODAY: {today_str}.
USER REQUEST: "{user_query}"

INTENT DETECTION (Prefer JSON for these common queries):
- Check Team Attendance: {{"action": "view_team_attendance", "params": {{}}}}
- View Team/Dept Tasks: {{"action": "view_team_tasks", "params": {{}}}}
- View Pending Leaves (Manager/Exec): {{"action": "view_pending_leaves", "params": {{}}}}
- Payroll Status: {{"action": "get_payroll", "params": {{"month": "December"}}}}
- Timesheets: {{"action": "view_team_timesheets", "params": {{}}}}

- Leave Status (Self): {{"action": "check_leave_status", "params": {{}}}}
- Apply Leave: {{"action": "apply_leave", "params": {{"from_date": "...", "to_date": "...", "reason": "..."}}}}
- Approve Leave: {{"action": "manager_approve_leave", "params": {{"employee_name": "..."}}}}
- Reject Leave: {{"action": "manager_reject_leave", "params": {{"employee_name": "...", "reason": "..."}}}}

- Assign Task (Manager): {{"action": "create_task", "params": {{"title": "...", "assigned_to": "...", "priority": "...", "due_date": "..."}}}}
- Create Dept (Exec): {{"action": "create_department", "params": {{"department_name": "..."}}}}
- Post Announcement (Exec): {{"action": "post_announcement", "params": {{"title": "...", "message": "...", "event_date": "YYYY-MM-DD", "event_time": "HH:MM:SS"}}}}
- View My Tasks: {{"action": "view_my_tasks", "params": {{}}}}
- View All Active Tasks: {{"action": "view_all_active_tasks", "params": {{}}}}
- List Employees: {{"action": "view_all_employees", "params": {{}}}}

- Raw Data Query: SELECT ... (Use only for custom queries not covered above)

CRITICAL: For any request that involves CHANGING data OR common dashboard listing (attendance, tasks, leaves, payroll), you MUST return a JSON action.
Return ONLY SQL or JSON.
"""

def parse_response(response_str: str):
    cleaned = response_str.strip()
    
    # Try to extract JSON from within the response if it's not the whole thing
    import re
    json_match = re.search(r'(\{.*\})', cleaned, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1)), True
        except:
            pass
            
    # Try to extract SQL
    sql_match = re.search(r'(SELECT\s+.*)', cleaned, re.IGNORECASE | re.DOTALL)
    if sql_match:
        sql = sql_match.group(1).split(";")[0].strip()
        return sql, False
    
    return cleaned, False
