        const CLASS_ENROLLMENT_CACHE = {};
        function getDepartmentEnrollmentCount(department) {
            return Object.values(USER_DATABASE).filter(u => u.role === 'student' && u.department === department).length;
        }
        function getEnrollmentCount(className) {
            if (CLASS_ENROLLMENT_CACHE[className] !== undefined) return CLASS_ENROLLMENT_CACHE[className];
            const department = CLASS_DEPARTMENTS[className];
            if (department) {
                CLASS_ENROLLMENT_CACHE[className] = getDepartmentEnrollmentCount(department);
                return CLASS_ENROLLMENT_CACHE[className];
            }
            CLASS_ENROLLMENT_CACHE[className] = CLASS_ENROLLMENT_COUNTS[className] || 0;
            return CLASS_ENROLLMENT_CACHE[className];
        }

        function renderSeatPlanClasses() {
            const classSelector = document.getElementById('seat-plan-class');
            if (!classSelector) return;
            const assignedSchedule = ASSIGNED_SCHEDULES[sessionUser.username] || ASSIGNED_SCHEDULES.faculty1;
            classSelector.innerHTML = assignedSchedule.map(item =>
                `<option value="${item.className}">${item.className} - ${getEnrollmentCount(item.className)} students</option>`
            ).join('');
        }

        function renderReportClassSelector() {
            const selector = document.getElementById('report-class-selector');
            if (!selector) return;
            const assignedSchedule = ASSIGNED_SCHEDULES[sessionUser.username] || [];
            selector.innerHTML = '<option value="">Select assigned class</option>' + assignedSchedule.map(item =>
                `<option value="${item.className}">${item.className} - ${CLASS_WORK_TYPES[item.className] || 'Lecture'} - ${ROOM_ASSIGNMENTS[item.className] || item.room}</option>`
            ).join('');
            selector.value = '';
            document.getElementById('report-action-button').disabled = true;
        }

        function selectReportClass(className) {
            document.getElementById('report-action-button').disabled = !className;
            if (className) loadClassSeatPlan(className);
        }

        function submitAttendanceReport() {
            const reportClass = document.getElementById('report-class-selector').value;
            if (sessionUser.role !== 'teacher' || !reportClass) return;
            const scheduleItem = WEEKLY_CLASS_SCHEDULE.find(i => i.className === reportClass && i.teacher === sessionUser.username);
            const seatPlan = seatPlansByClass[reportClass] || seatingPlanMatrix;
            const counts = seatPlan.flat().reduce((s, seat) => {
                const status = seat ? seat.status : 'empty';
                s[status] = (s[status] || 0) + 1;
                return s;
            }, { present: 0, absent: 0, late: 0, excused: 0, dropped: 0, empty: 0 });
            const report = {
                id: Date.now(), teacher: sessionUser.name, subject: reportClass,
                workType: CLASS_WORK_TYPES[reportClass] || 'Lecture',
                room: ROOM_ASSIGNMENTS[reportClass] || scheduleItem.room,
                date: new Date().toLocaleDateString(), counts,
                totalStudents: getEnrollmentCount(reportClass), status: 'Submitted'
            };
            submittedAttendanceReports.unshift(report);
            localStorage.setItem('taptrackAttendanceReports', JSON.stringify(submittedAttendanceReports));
            logAudit('REPORT_SUBMITTED', `${reportClass} by ${sessionUser.name}`);
            if (document.getElementById('admin-summary-cards')) renderAdminSummary();
            const message = document.getElementById('report-submit-message');
            message.innerText = `${reportClass} attendance report submitted to faculty.`;
            message.style.display = 'block';
        }

        function submitFacultyToAdmin() {
            if (sessionUser.role !== 'faculty') return;
            const selectedDepartment = document.getElementById('faculty-department-selector').value;
            const departments = selectedDepartment === 'all'
                ? ['Engineering', 'STED', 'General Education', 'Information Technology']
                : [selectedDepartment];
            const reports = submittedAttendanceReports.filter(r => departments.includes(CLASS_DEPARTMENTS[r.subject]));
            const submission = {
                id: Date.now(), faculty: sessionUser.name, departments,
                reportCount: reports.length,
                enrolled: departments.reduce((t, d) => t + getDepartmentEnrollmentCount(d), 0),
                present: reports.reduce((t, r) => t + (r.counts.present || 0), 0),
                absent: reports.reduce((t, r) => t + (r.counts.absent || 0), 0),
                late: reports.reduce((t, r) => t + (r.counts.late || 0), 0),
                submittedAt: new Date().toLocaleString(), status: 'Submitted'
            };
            facultyAdminSubmissions.unshift(submission);
            localStorage.setItem('taptrackFacultyAdminSubmissions', JSON.stringify(facultyAdminSubmissions));
            logAudit('FACULTY_SUBMISSION', departments.join(', '));
            const message = document.getElementById('report-submit-message');
            message.innerText = `${departments.join(', ')} submission sent to admin.`;
            message.style.display = 'block';
        }

        function renderFacultyAdminSubmissions() {
            const list = document.getElementById('faculty-admin-submission-list');
            if (!list) return;
            list.innerHTML = facultyAdminSubmissions.length ? facultyAdminSubmissions.map(s => `
                <div class="report-card">
                    <div class="report-card-header"><h3>${escapeHTML(s.departments.join(', '))}</h3><small>${escapeHTML(s.submittedAt)}</small></div>
                    <p><strong>Submitted by:</strong> ${escapeHTML(s.faculty)}</p>
                    <p><strong>Reports:</strong> ${s.reportCount} | <strong>Enrolled:</strong> ${s.enrolled}</p>
                    <div class="report-counts">
                        <div class="report-count"><strong>${s.present}</strong>Present</div>
                        <div class="report-count"><strong>${s.absent}</strong>Absent</div>
                        <div class="report-count"><strong>${s.late}</strong>Late</div>
                    </div>
                    <p><strong>Status:</strong> ${escapeHTML(s.status)}</p>
                </div>
            `).join('') : '<p class="review-empty">No faculty submissions received yet.</p>';
        }

        function renderFacultyReports() {
            const list = document.getElementById('faculty-report-list');
            if (!list) return;
            list.innerHTML = submittedAttendanceReports.length ? submittedAttendanceReports.map(r => `
                <div class="report-card">
                    <div class="report-card-header"><h3>Attendance Report - ${r.subject}</h3><small>Submitted attendance proof for faculty records</small></div>
                    <p><strong>Teacher:</strong> ${r.teacher}</p>
                    <p><strong>Room:</strong> ${r.room} | <strong>Class type:</strong> ${r.workType}</p>
                    <p><strong>Class date:</strong> ${r.date} | <strong>Enrolled:</strong> ${r.totalStudents}</p>
                    <div class="report-counts">
                        <div class="report-count"><strong>${r.counts.present}</strong>Present</div>
                        <div class="report-count"><strong>${r.counts.excused}</strong>Excused</div>
                        <div class="report-count"><strong>${r.counts.absent}</strong>Absent</div>
                        <div class="report-count"><strong>${r.counts.late}</strong>Late</div>
                        <div class="report-count"><strong>${r.counts.dropped}</strong>Dropped</div>
                    </div>
                    <p><strong>Status:</strong> ${r.status}</p>
                    <button class="quick-action print-report ripple" onclick="printAttendanceReport(${r.id})">Print Report</button>
                </div>
            `).join('') : '<p class="review-empty">No attendance reports submitted yet.</p>';
        }

        function printAttendanceReport(reportId) {
            const report = submittedAttendanceReports.find(i => i.id === reportId);
            if (!report) return;
            const printWindow = window.open('', '_blank', 'width=850,height=700');
            printWindow.document.write(`<html><head><title>Attendance Report - ${report.subject}</title><style>body{font-family:Arial,sans-serif;color:#1c1e21;padding:35px}h1{font-size:24px;border-bottom:2px solid #00e5ff;padding-bottom:10px}p{font-size:14px;margin:8px 0}.counts{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:20px 0}.count{background:#f0f2f5;padding:12px;text-align:center}.count strong{display:block;font-size:22px;color:#00e5ff}</style></head><body><h1>Attendance Report</h1><p><strong>Subject:</strong> ${report.subject}</p><p><strong>Teacher:</strong> ${report.teacher}</p><p><strong>Room:</strong> ${report.room}</p><p><strong>Class type:</strong> ${report.workType}</p><p><strong>Date:</strong> ${report.date}</p><p><strong>Enrolled students:</strong> ${report.totalStudents}</p><div class="counts"><div class="count"><strong>${report.counts.present}</strong>Present</div><div class="count"><strong>${report.counts.excused}</strong>Excused</div><div class="count"><strong>${report.counts.absent}</strong>Absent</div><div class="count"><strong>${report.counts.late}</strong>Late</div><div class="count"><strong>${report.counts.dropped}</strong>Dropped</div></div><p><strong>Status:</strong> ${report.status}</p></body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
