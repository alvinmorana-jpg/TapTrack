        function refreshVisibleWorkspace() {
            if (!sessionUser) return;
            if (sessionUser.role === 'student') {
                renderStudentSchedule();
                renderStudentAttendance();
            } else if (sessionUser.role === 'teacher' || sessionUser.role === 'faculty') {
                renderAssignedSchedule();
                if (sessionUser.role === 'faculty') renderRoomMonitor();
                renderTeacherReviewRequests();
                renderFacultyReports();
                renderAttendanceCharts();
            } else if (sessionUser.role === 'admin') {
                renderAdminSummary();
                renderFacultyAdminSubmissions();
            }
        }

        let lastStorageHash = JSON.stringify([
            roomLayout, submittedAttendanceReports, attendanceReviewRequests,
            attendanceOverrides, facultyAdminSubmissions
        ]);

        function refreshVisibleWorkspaceIfChanged() {
            if (!sessionUser) return;
            if (document.hidden) return;
            const freshRoom = readStorage('taptrackDeanRoomLayout', roomLayout);
            const freshReports = readStorage('taptrackAttendanceReports', submittedAttendanceReports);
            const freshReviews = readStorage('taptrackAttendanceReviews', attendanceReviewRequests);
            const freshOverrides = readStorage('taptrackAttendanceOverrides', attendanceOverrides);
            const freshSubs = readStorage('taptrackFacultyAdminSubmissions', facultyAdminSubmissions);
            const newHash = JSON.stringify([freshRoom, freshReports, freshReviews, freshOverrides, freshSubs]);
            if (newHash === lastStorageHash) return;
            lastStorageHash = newHash;
            roomLayout = freshRoom;
            submittedAttendanceReports = freshReports;
            attendanceReviewRequests = freshReviews;
            attendanceOverrides = freshOverrides;
            facultyAdminSubmissions = freshSubs;
            refreshVisibleWorkspace();
        }

        window.addEventListener('storage', event => {
            if (['taptrackDeanRoomLayout', 'taptrackAttendanceReports', 'taptrackAttendanceReviews',
                'taptrackAttendanceOverrides', 'taptrackFacultyAdminSubmissions'].includes(event.key)) {
                lastStorageHash = '';
                refreshVisibleWorkspaceIfChanged();
            }
        });
        window.addEventListener('taptrack-room-update', () => {
            lastStorageHash = '';
            refreshVisibleWorkspaceIfChanged();
        });
        window.addEventListener('focus', refreshVisibleWorkspaceIfChanged);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshVisibleWorkspaceIfChanged(); });
        setInterval(refreshVisibleWorkspaceIfChanged, 15000);

        document.getElementById('uid').value = 'teacher1';
        document.getElementById('pwd').value = '123';
