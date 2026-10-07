        function login() {
            const uid = document.getElementById('uid').value.trim();
            const pwd = document.getElementById('pwd').value.trim();
            if (USER_DATABASE[uid] && USER_DATABASE[uid].password === pwd) {
                const newUser = { ...USER_DATABASE[uid], username: uid };
                const sequence = LOGIN_SEQUENCES[newUser.role];
                runLoader(sequence, () => {
                    sessionUser = newUser;
                    renderAppLayout();
                }, 2400);
            } else {
                alert("Login Failed! Please enter correct User ID and Password.");
            }
        }

        function logout() {
            if (!sessionUser) return;
            const sequence = LOGOUT_SEQUENCES[sessionUser.role] || LOGOUT_SEQUENCES.student;
            runLoader(sequence, () => {
                sessionUser = null;
                pendingRoomChanges = {};
                updateBroadcastBadge();
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('app-navbar').style.display = 'none';
                document.querySelectorAll('.dashboard-container').forEach(d => d.style.display = 'none');
            }, 2000);
        }

        function renderAppLayout() {
            document.getElementById('login-screen').style.display = 'none';
            const navbar = document.getElementById('app-navbar');
            navbar.style.display = 'flex';
            const departmentLabel = sessionUser.department ? ` - ${sessionUser.department}` : '';
            document.getElementById('user-profile-tag').innerText = `${sessionUser.name} (${sessionUser.role.toUpperCase()}${departmentLabel})`;
            document.querySelectorAll('.dashboard-container').forEach(d => d.style.display = 'none');

            if (sessionUser.role === 'faculty') {
                pendingRoomChanges = {};
                updateBroadcastBadge();
            }

            if (sessionUser.role === 'student') {
                document.getElementById('student-dashboard').style.display = 'block';
                renderAnnouncements('student-announcements');
                renderStudentSchedule();
                renderStudentAttendance();
                renderAttendanceReviewClasses();
                switchStudentTab('student-overview-tab');
            } else if (sessionUser.role === 'teacher' || sessionUser.role === 'faculty') {
                document.getElementById('staff-dashboard').style.display = 'block';
                configureStaffWorkspace();
                renderAssignedSchedule();
                renderSeatPlanClasses();
                renderReportClassSelector();
                renderAnnouncements('staff-announcements');
                renderRoomMonitor();
                renderTeacherReviewRequests();
                renderFacultyReports();
                renderAttendanceCharts();
                if (sessionUser.role === 'teacher') {
                    loadClassSeatPlan(ASSIGNED_SCHEDULES[sessionUser.username][0].className);
                    switchStaffTab('schedule-tab');
                } else {
                    switchStaffTab('room-tab');
                }
            } else if (sessionUser.role === 'admin') {
                document.getElementById('admin-dashboard').style.display = 'block';
                renderAnnouncements('admin-announcements');
                renderAdminSummary();
                renderFacultyAdminSubmissions();
            }
        }
