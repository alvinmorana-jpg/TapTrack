        const readStorage = (key, fallback) => {
            try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
            catch { localStorage.removeItem(key); return fallback; }
        };
        const escapeHTML = value => String(value).replace(/[&<>'"]/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[character]));

        let submittedAttendanceReports = readStorage('taptrackAttendanceReports', []);
        let facultyAdminSubmissions = readStorage('taptrackFacultyAdminSubmissions', []);
        let attendanceReviewRequests = readStorage('taptrackAttendanceReviews', []);
        let attendanceOverrides = readStorage('taptrackAttendanceOverrides', {});

        let seatingPlanMatrix = Array(5).fill(null).map(() => Array(5).fill(null));
        let permanentSeatAssignments = {};
        let draggedStudentName = null;
        let selectedSeatPlanClass = '';
        let seatPlansByClass = {};
        let assignmentsByClass = {};
        loadSavedSeatPlan();

        let currentClassCancelled = false;
        let selectedAttendanceStatus = 'present';
        let sessionUser = null;

        let pendingRoomChanges = {};
        let occasionEditingRoom = null;

        // Audit log
        let auditLog = readStorage('taptrackAuditLog', []);
        function logAudit(action, detail) {
            auditLog.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                actor: sessionUser ? sessionUser.name : 'system',
                actorRole: sessionUser ? sessionUser.role : 'system',
                action, detail
            });
            if (auditLog.length > 500) auditLog = auditLog.slice(0, 500);
            localStorage.setItem('taptrackAuditLog', JSON.stringify(auditLog));
        }

        // Class rosters
        const ROSTER_STORAGE_KEY = 'taptrackClassRosters';
        let classRosters = readStorage(ROSTER_STORAGE_KEY, {});

        function getRosterForClass(className) {
            if (!classRosters[className]) {
                const dept = CLASS_DEPARTMENTS[className];
                const students = Object.entries(USER_DATABASE)
                    .filter(([k, u]) => u.role === 'student' && u.department === dept)
                    .map(([k, u]) => ({
                        studentId: u.studentId,
                        name: u.name,
                        username: k,
                        status: 'enrolled'
                    }));
                classRosters[className] = students;
            }
            return classRosters[className];
        }

        function saveRosters() {
            localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(classRosters));
        }

        let roomLayout = readStorage('taptrackDeanRoomLayout', null);
        if (!roomLayout) {
            roomLayout = FACULTY_ROOMS.reduce((layout, room) => {
                const scheduledClass = Object.keys(ROOM_ASSIGNMENTS).find(c => ROOM_ASSIGNMENTS[c] === room) || '';
                layout[room] = { status: scheduledClass ? 'scheduled' : 'available', scheduledClass, temporaryClass: '' };
                return layout;
            }, {});
        } else {
            FACULTY_ROOMS.forEach(room => {
                if (roomLayout[room]) return;
                const scheduledClass = Object.keys(ROOM_ASSIGNMENTS).find(c => ROOM_ASSIGNMENTS[c] === room) || '';
                roomLayout[room] = { status: scheduledClass ? 'scheduled' : 'available', scheduledClass, temporaryClass: '' };
            });
        }

        (function cleanupStaleTempAssignments() {
            const seen = new Set();
            FACULTY_ROOMS.forEach(room => {
                const layout = roomLayout[room];
                if (!layout || !layout.temporaryClass) return;
                const cls = layout.temporaryClass;
                const exists = WEEKLY_CLASS_SCHEDULE.some(c => c.className === cls);
                if (!exists || layout.status === 'occasion' || seen.has(cls)) {
                    layout.temporaryClass = '';
                } else {
                    seen.add(cls);
                }
            });
        })();

        localStorage.setItem('taptrackDeanRoomLayout', JSON.stringify(roomLayout));
