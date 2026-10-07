        function showStudentId() { alert(`${sessionUser.name}\nStudent ID: ${sessionUser.studentId}`); }

        function getStudentSubjects() {
            return [...new Set([
                ...(STUDENT_DEPARTMENT_SUBJECTS[sessionUser.department] || []),
                ...COMMON_STUDENT_SUBJECTS
            ])];
        }

        function getRoomScheduleNotice(item) {
            const room = getEffectiveRoom(item);
            const layout = roomLayout[room];
            if (!layout) return '';
            const duration = getClassDuration(item);
            const durationLabel = duration >= 60
                ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60}m` : ''}`
                : `${duration}m`;
            if (layout.status === 'occasion') {
                const details = layout.occasionDetails;
                let detailLine = '';
                if (details) {
                    const timeStr = details.durationType === 'allday' ? 'Whole day' : `${details.start} – ${details.end}`;
                    detailLine = `<span style="display:block; font-size:11px; color:#ff2e97; margin-top:3px; font-weight:700;">📅 ${escapeHTML(details.date)} • ⏱ ${escapeHTML(timeStr)} • ${escapeHTML(details.reason)}</span>`;
                }
                const teacherAction = sessionUser?.role === 'teacher'
                    ? `<button type="button" class="quick-action ripple schedule-room-action" onclick='requestTeacherRoomMove(${JSON.stringify(item.className)})'>Auto assign room</button>`
                    : '';
                return `<span class="schedule-alert">${escapeHTML(room)} is reserved for an occasion. This class needs a room update.</span>${detailLine}${teacherAction}`;
            }
            if (layout.status === 'available') {
                // Dean set this room to "Gray - No class" and broadcast it
                return `<span class="schedule-alert">🚫 No class: ${escapeHTML(room)} was marked "No class" by the dean.</span>`;
            }
            if (layout.temporaryClass === item.className) {
                return `<span class="schedule-temporary">Temporary room: ${escapeHTML(room)} (${item.time}–${item.endTime}, ${durationLabel})</span>`;
            }
            return '';
        }

        function renderStudentSchedule() {
            const subjects = getStudentSubjects();
            const schedule = WEEKLY_CLASS_SCHEDULE
                .filter(item => subjects.includes(item.className))
                .filter((item, index, items) => items.findIndex(c => c.className === item.className) === index);
            document.getElementById('student-schedule').innerHTML = schedule.map(item => {
                const room = getEffectiveRoom(item);
                const notice = getRoomScheduleNotice(item);
                return `<li>
                    <span>
                        <strong>${escapeHTML(item.day)}</strong> - ${escapeHTML(item.className)}
                        <small style="color:#8b9bc7; font-weight:bold;"> (${escapeHTML(room)})</small>
                        ${notice}
                    </span>
                    <span class="schedule-time">${escapeHTML(item.time)} – ${escapeHTML(item.endTime || '')}</span>
                </li>`;
            }).join('');
        }

        function renderStudentAttendance() {
            const subjects = getStudentSubjects();
            const records = STUDENT_ATTENDANCE_RECORDS.filter(r => subjects.includes(r.className)).map(r => ({
                ...r,
                status: attendanceOverrides[`${sessionUser.studentId}-${r.className}-${r.date}`] || r.status
            }));
            const counts = records.reduce((s, r) => { s[r.status] += 1; return s; },
                { present: 0, excused: 0, absent: 0, late: 0 });
            document.getElementById('attendance-summary').innerHTML = `
                <div class="attendance-summary-card present"><strong>${counts.present}</strong>Present</div>
                <div class="attendance-summary-card excused"><strong>${counts.excused}</strong>Excused</div>
                <div class="attendance-summary-card absent"><strong>${counts.absent}</strong>Absent</div>
                <div class="attendance-summary-card late"><strong>${counts.late}</strong>Late</div>
            `;
            const recordsBySubject = records.reduce((g, r) => { (g[r.className] ||= []).push(r); return g; }, {});
            document.getElementById('attendance-records').innerHTML = subjects.map(subject => {
                const subjectRecords = recordsBySubject[subject] || [];
                const subjectCounts = subjectRecords.reduce((s, r) => { s[r.status] += 1; return s; },
                    { present: 0, excused: 0, absent: 0, late: 0 });
                const subjectRows = subjectRecords.length
                    ? subjectRecords.map(r => `<div class="attendance-row"><span><strong>${escapeHTML(r.date)}</strong></span><span class="attendance-status ${r.status}">${r.status.toUpperCase()}</span></div>`).join('')
                    : '<div class="subject-attendance-empty">No attendance records yet.</div>';
                const countLabel = `${subjectCounts.present} present, ${subjectCounts.absent} absent, ${subjectCounts.late} late${subjectCounts.excused ? `, ${subjectCounts.excused} excused` : ''}`;
                return `<section class="subject-attendance-section"><div class="subject-attendance-header"><h3>${escapeHTML(subject)}</h3><span class="subject-attendance-counts">${countLabel}</span></div>${subjectRows}</section>`;
            }).join('');
        }

        function switchStudentTab(tabId) {
            document.querySelectorAll('#student-dashboard .tab-panel').forEach(p => p.classList.toggle('active', p.id === tabId));
            document.getElementById('student-overview-tab-button').classList.toggle('active', tabId === 'student-overview-tab');
            document.getElementById('student-attendance-tab-button').classList.toggle('active', tabId === 'student-attendance-tab');
        }

        function submitAttendanceFollowUp() {
            const input = document.getElementById('attendance-follow-up');
            const message = document.getElementById('follow-up-message');
            if (!input.value.trim()) {
                message.innerText = 'Please enter a message before submitting.';
                message.style.color = '#ff2e97';
            } else {
                message.innerText = 'Your follow-up has been sent to your teacher.';
                message.style.color = '#00ff9d';
                input.value = '';
            }
            message.style.display = 'block';
        }
