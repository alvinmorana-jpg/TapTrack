        const ANNOUNCEMENTS_STORAGE_KEY = 'taptrackAnnouncements';
        announcementsList = readStorage(ANNOUNCEMENTS_STORAGE_KEY, announcementsList);
        let lastAnnouncementsJson = JSON.stringify(announcementsList);

        function saveAnnouncements() {
            lastAnnouncementsJson = JSON.stringify(announcementsList);
            localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, lastAnnouncementsJson);
        }

        function renderAllAnnouncements() {
            renderAnnouncements('student-announcements');
            renderAnnouncements('admin-announcements');
            renderAnnouncements('staff-announcements');
        }

        // Pull announcements posted from another tab/window and redraw them
        function syncAnnouncements() {
            const fresh = readStorage(ANNOUNCEMENTS_STORAGE_KEY, announcementsList);
            const freshJson = JSON.stringify(fresh);
            if (freshJson === lastAnnouncementsJson) return;
            announcementsList = fresh;
            lastAnnouncementsJson = freshJson;
            renderAllAnnouncements();
        }

        // Department targets for faculty announcements (code -> department name used in the data)
        const ANNOUNCEMENT_DEPARTMENTS = [
            { code: 'ALL', label: 'ALL - Everyone', department: null },
            { code: 'EAN', label: 'EAN - Engineering', department: 'Engineering' },
            { code: 'STED', label: 'STED', department: 'STED' },
            { code: 'GE', label: 'GE - General Education', department: 'General Education' },
            { code: 'IT', label: 'IT - Information Technology', department: 'Information Technology' }
        ];

        function getViewerDepartmentCode() {
            if (!sessionUser) return null;
            let department = null;
            if (sessionUser.role === 'student') department = sessionUser.department;
            else if (sessionUser.role === 'teacher') department = TEACHER_DEPARTMENTS[sessionUser.username];
            const match = ANNOUNCEMENT_DEPARTMENTS.find(d => d.department && d.department === department);
            return match ? match.code : null; // faculty/admin: null = sees every department
        }

        // Faculty pick a department (EAN / STED / ALL ...); teachers keep Students / Teachers / Everyone
        function configureAnnouncementAudience(isFaculty) {
            const select = document.getElementById('staff-announcement-audience');
            if (!select) return;
            const options = isFaculty
                ? ANNOUNCEMENT_DEPARTMENTS.map(d => [d.code, d.label])
                : [['student', 'Students'], ['teacher', 'Teachers'], ['all', 'Everyone']];
            select.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
        }

        function renderAnnouncements(targetId) {
            const target = document.getElementById(targetId);
            if (!target) return;
            const viewer = targetId === 'student-announcements' ? 'student' : targetId === 'staff-announcements' ? 'teacher' : 'all';
            const viewerDept = getViewerDepartmentCode();
            target.innerHTML = announcementsList.filter(a => {
                const audience = typeof a === 'string' ? 'all' : a.audience;
                const dept = typeof a === 'string' ? 'ALL' : (a.department || 'ALL');
                const roleOk = audience === 'all' || audience === viewer;
                const deptOk = dept === 'ALL' || !viewerDept || dept === viewerDept;
                return roleOk && deptOk;
            }).map(a => {
                const message = typeof a === 'string' ? a : a.message;
                const dept = typeof a === 'string' ? 'ALL' : (a.department || 'ALL');
                const tag = dept === 'ALL' ? '' : `<strong>[${escapeHTML(dept)}]</strong> `;
                return `<div class="announcement-box">${tag}${escapeHTML(message)}</div>`;
            }).join('');
        }

        function publishAnnouncement(message, audience = 'all', department = 'ALL') {
            announcementsList.unshift({ message, audience, department });
            saveAnnouncements();
            renderAllAnnouncements();
        }

        function sendStaffAnnouncement() {
            const input = document.getElementById('staff-announcement-text');
            const audience = document.getElementById('staff-announcement-audience').value;
            const message = input.value.trim();
            if (!message) return;
            if (sessionUser && sessionUser.role === 'faculty') {
                publishAnnouncement(message, 'all', audience); // audience holds the department code here
            } else {
                publishAnnouncement(message, audience);
            }
            input.value = '';
        }

        function addAnnouncement() {
            const input = document.getElementById('new-ann-text');
            const announcement = input.value.trim();
            if (!announcement) return;
            announcementsList.unshift(announcement);
            saveAnnouncements();
            input.value = '';
            renderAllAnnouncements();
        }

        window.addEventListener('storage', event => {
            if (event.key === ANNOUNCEMENTS_STORAGE_KEY) syncAnnouncements();
        });
        window.addEventListener('focus', syncAnnouncements);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) syncAnnouncements(); });
        setInterval(syncAnnouncements, 5000);
