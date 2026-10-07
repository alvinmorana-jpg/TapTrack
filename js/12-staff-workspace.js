        function getTeacherName(username) { return USER_DATABASE[username] ? USER_DATABASE[username].name : username; }

        function configureStaffWorkspace() {
            const isFaculty = sessionUser.role === 'faculty';
            const department = TEACHER_DEPARTMENTS[sessionUser.username];
            configureAnnouncementAudience(isFaculty);
            document.getElementById('staff-role-badge').innerText = isFaculty ? 'Faculty Workspace' : `Teacher Workspace - ${department}`;
            document.getElementById('staff-dashboard-title').innerText = isFaculty ? 'Faculty Dashboard' : 'Teacher Dashboard';
            document.getElementById('staff-dashboard-description').innerText = isFaculty
                ? 'Manage your department: classes, teachers, students, and rooms.'
                : `Manage ${department} classes and attendance.`;
            document.getElementById('schedule-tab-button').style.display = isFaculty ? 'none' : 'block';
            document.getElementById('seating-tab-button').style.display = isFaculty ? 'none' : 'block';
            document.getElementById('reviews-tab-button').style.display = isFaculty ? 'none' : 'block';
            document.getElementById('room-tab-button').style.display = isFaculty ? 'block' : 'none';
            document.getElementById('reports-tab-button').style.display = isFaculty ? 'block' : 'none';
            document.getElementById('charts-tab-button').style.display = isFaculty ? 'block' : 'none';
            document.querySelector('.faculty-actions').style.display = isFaculty ? 'flex' : 'none';
            document.getElementById('faculty-admin-controls').style.display = isFaculty ? 'block' : 'none';
            document.getElementById('report-action-button').style.display = isFaculty ? 'none' : 'block';
            document.getElementById('report-class-selector').style.display = isFaculty ? 'none' : 'block';
            // Show/hide faculty-only tabs
            document.querySelectorAll('.faculty-only').forEach(el => {
                el.style.display = isFaculty ? 'inline-block' : 'none';
            });
        }

        function switchStaffTab(tabId) {
            document.querySelectorAll('#staff-dashboard .tab-panel').forEach(p => p.classList.toggle('active', p.id === tabId));
            ['schedule', 'seating', 'reviews', 'room', 'reports', 'charts', 'roster', 'teachers', 'progress', 'audit'].forEach(key => {
                const btn = document.getElementById(`${key}-tab-button`);
                if (btn) btn.classList.toggle('active', `${key}-tab` === tabId);
            });
            // Lazy-render faculty tabs
            if (tabId === 'roster-tab') renderRosterEditor(document.getElementById('roster-class-selector').value);
            if (tabId === 'teachers-tab') renderTeachersOverview();
            if (tabId === 'progress-tab') renderStudentProgress();
            if (tabId === 'audit-tab') renderDeptAudit();
        }
