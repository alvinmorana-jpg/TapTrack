        // ============================================================
        // FACULTY MANAGEMENT FUNCTIONS
        // ============================================================
        function renderRosterEditor(className) {
            const selector = document.getElementById('roster-class-selector');
            if (!className && selector) className = selector.value;
            if (!className) {
                const dept = TEACHER_DEPARTMENTS[sessionUser.username];
                const classes = [...new Set(WEEKLY_CLASS_SCHEDULE.filter(c => CLASS_DEPARTMENTS[c.className] === dept).map(c => c.className))];
                className = classes[0];
                if (selector && classes.length) {
                    selector.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
                    selector.value = className;
                }
            }
            if (!className) return;

            const roster = getRosterForClass(className);
            const counts = roster.reduce((a, s) => { a[s.status] = (a[s.status] || 0) + 1; return a; }, {});
            document.getElementById('roster-summary').innerHTML = `
                <div class="stat-card"><strong>${counts.enrolled || 0}</strong><span>Enrolled</span></div>
                <div class="stat-card"><strong>${counts.dropped || 0}</strong><span>Dropped</span></div>
                <div class="stat-card"><strong>${roster.length}</strong><span>Total</span></div>
            `;

            const editor = document.getElementById('roster-editor');
            if (!roster.length) {
                editor.innerHTML = '<p class="review-empty">No students in this class roster yet.</p>';
            } else {
                editor.innerHTML = `<div class="data-table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${roster.map((s, i) => `
                                <tr>
                                    <td>${escapeHTML(s.studentId)}</td>
                                    <td class="name-cell">${escapeHTML(s.name)}</td>
                                    <td><span class="table-status ${s.status === 'enrolled' ? 'enrolled' : 'dropped'}">${escapeHTML(s.status)}</span></td>
                                    <td>
                                        <button class="quick-action ripple" style="padding:6px 12px; font-size:11px;" onclick="adminToggleRosterStudent(${i})">${s.status === 'enrolled' ? 'Drop' : 'Restore'}</button>
                                        <button class="quick-action ripple" style="padding:6px 12px; font-size:11px; margin-left:6px; background: rgba(255,46,151,0.15) !important; color:#ff2e97 !important;" onclick="adminRemoveRosterStudent(${i})">Remove</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="quick-actions" style="margin-top: 14px;">
                    <button class="quick-action ripple" onclick="adminAddStudentToRoster('${className}')">➕ Add Student</button>
                </div>`;
            }
        }

        function adminToggleRosterStudent(index) {
            const className = document.getElementById('roster-class-selector').value;
            const roster = getRosterForClass(className);
            if (!roster[index]) return;
            roster[index].status = roster[index].status === 'enrolled' ? 'dropped' : 'enrolled';
            saveRosters();
            logAudit('ROSTER_STATUS', `${className} - ${roster[index].name} → ${roster[index].status}`);
            renderRosterEditor(className);
        }

        function adminRemoveRosterStudent(index) {
            const className = document.getElementById('roster-class-selector').value;
            const roster = getRosterForClass(className);
            if (!roster[index]) return;
            const student = roster[index];
            if (!confirm(`Remove ${student.name} from ${className}?`)) return;
            roster.splice(index, 1);
            saveRosters();
            logAudit('ROSTER_REMOVE', `${className} - ${student.name} removed`);
            renderRosterEditor(className);
        }

        function adminAddStudentToRoster(className) {
            const name = prompt('Student full name:');
            if (!name) return;
            const id = prompt('Student ID (e.g., 11-00099):') || `11-${String(Date.now()).slice(-5)}`;
            const roster = getRosterForClass(className);
            roster.push({ studentId: id, name, username: 'external', status: 'enrolled' });
            saveRosters();
            logAudit('ROSTER_ADD', `${className} - ${name} (${id}) added`);
            renderRosterEditor(className);
        }

        function renderTeachersOverview() {
            const el = document.getElementById('teachers-overview');
            if (!el) return;
            const dept = TEACHER_DEPARTMENTS[sessionUser.username];
            const teacherIds = Object.keys(TEACHER_DEPARTMENTS).filter(t => TEACHER_DEPARTMENTS[t] === dept);

            if (!teacherIds.length) {
                el.innerHTML = '<p class="review-empty">No teachers in this department.</p>';
                return;
            }

            el.innerHTML = teacherIds.map(tid => {
                const user = USER_DATABASE[tid];
                if (!user) return '';
                const classes = TEACHER_SUBJECTS[tid] || [];
                const reports = submittedAttendanceReports.filter(r => r.teacher === user.name);
                const lastReport = reports[0];
                const pendingReviews = attendanceReviewRequests.filter(r =>
                    r.status === 'pending' && classes.includes(r.className)
                ).length;

                return `<div class="report-card">
                    <div class="report-card-header">
                        <h3>${escapeHTML(user.name)}</h3>
                        <small>${escapeHTML(tid)} • ${classes.length} class${classes.length === 1 ? '' : 'es'}</small>
                    </div>
                    <p><strong>Classes:</strong> ${classes.map(escapeHTML).join(', ') || '—'}</p>
                    <p><strong>Reports submitted:</strong> ${reports.length}</p>
                    <p><strong>Last submission:</strong> ${lastReport ? escapeHTML(lastReport.date) : 'Never'}</p>
                    <p><strong>Pending reviews:</strong> <span style="color: ${pendingReviews > 0 ? 'var(--neon-amber)' : 'var(--neon-green)'};">${pendingReviews}</span></p>
                </div>`;
            }).join('');
        }

        function renderStudentProgress() {
            const dept = TEACHER_DEPARTMENTS[sessionUser.username];
            const students = Object.entries(USER_DATABASE)
                .filter(([k, u]) => u.role === 'student' && u.department === dept);

            if (!students.length) {
                document.getElementById('progress-summary').innerHTML = '';
                document.getElementById('progress-list').innerHTML = '<p class="review-empty">No students in your department.</p>';
                return;
            }

            const stats = students.map(([username, u]) => {
                const records = STUDENT_ATTENDANCE_RECORDS
                    .filter(r => (STUDENT_DEPARTMENT_SUBJECTS[dept] || []).includes(r.className))
                    .map(r => ({
                        ...r,
                        status: attendanceOverrides[`${u.studentId}-${r.className}-${r.date}`] || r.status
                    }));
                const present = records.filter(r => r.status === 'present').length;
                const late = records.filter(r => r.status === 'late').length;
                const absent = records.filter(r => r.status === 'absent').length;
                const excused = records.filter(r => r.status === 'excused').length;
                const total = records.length || 1;
                const pct = Math.round((present + excused * 0.5) / total * 100);
                return { username, name: u.name, studentId: u.studentId, present, late, absent, excused, pct, total: records.length };
            });

            stats.sort((a, b) => a.pct - b.pct);

            const atRisk = stats.filter(s => s.pct < 75).length;
            const avg = Math.round(stats.reduce((sum, s) => sum + s.pct, 0) / stats.length);

            document.getElementById('progress-summary').innerHTML = `
                <div><strong>${stats.length}</strong>Students</div>
                <div><strong>${avg}%</strong>Avg Attendance</div>
                <div><strong>${atRisk}</strong>At Risk (&lt;75%)</div>
                <div><strong>${stats.filter(s => s.pct >= 90).length}</strong>Excellent (≥90%)</div>
            `;

            document.getElementById('progress-list').innerHTML = stats.map(s => `
                <div class="report-card" style="border-left: 4px solid ${s.pct < 75 ? '#ff2e97' : s.pct < 90 ? '#ffb020' : '#00ff9d'};">
                    <div class="report-card-header">
                        <h3>${escapeHTML(s.name)}</h3>
                        <small>${escapeHTML(s.studentId)}</small>
                    </div>
                    <div style="display:flex; align-items: center; gap: 12px; margin-top: 8px;">
                        <div style="flex: 1; height: 8px; background: rgba(5,8,22,0.7); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-soft);">
                            <div style="height: 100%; width: ${s.pct}%; background: ${s.pct < 75 ? 'linear-gradient(90deg,#ff2e97,#ff4757)' : s.pct < 90 ? 'linear-gradient(90deg,#ffb020,#ff8c00)' : 'linear-gradient(90deg,#00ff9d,#00e5ff)'};"></div>
                        </div>
                        <span style="font-weight: 800; font-size: 16px; color: ${s.pct < 75 ? 'var(--neon-magenta)' : s.pct < 90 ? 'var(--neon-amber)' : 'var(--neon-green)'}; font-family: 'JetBrains Mono', monospace;">${s.pct}%</span>
                    </div>
                    <p style="margin-top: 8px; font-size: 12px;">✅ ${s.present} present • ⏰ ${s.late} late • ❌ ${s.absent} absent${s.excused ? ` • 🟣 ${s.excused} excused` : ''}</p>
                </div>
            `).join('');
        }

        function renderDeptAudit() {
            const dept = TEACHER_DEPARTMENTS[sessionUser.username];
            const selector = document.getElementById('audit-class-selector');
            if (selector.options.length <= 1) {
                const classes = [...new Set(WEEKLY_CLASS_SCHEDULE.filter(c => CLASS_DEPARTMENTS[c.className] === dept).map(c => c.className))];
                selector.innerHTML = '<option value="all">All Classes</option>' + classes.map(c => `<option value="${c}">${c}</option>`).join('');
            }
            const classFilter = selector.value;

            const subjects = STUDENT_DEPARTMENT_SUBJECTS[dept] || [];
            const records = STUDENT_ATTENDANCE_RECORDS
                .filter(r => subjects.includes(r.className))
                .filter(r => classFilter === 'all' || r.className === classFilter);

            const el = document.getElementById('dept-audit-list');
            if (!records.length) {
                el.innerHTML = '<p class="review-empty">No records to display.</p>';
                return;
            }

            el.innerHTML = `<div class="data-table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Override</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.slice(0, 200).map((r) => `
                            <tr>
                                <td class="name-cell">${escapeHTML(r.className)}</td>
                                <td>${escapeHTML(r.date)}</td>
                                <td><span class="attendance-status ${r.status}">${r.status.toUpperCase()}</span></td>
                                <td>
                                    <select class="mini-select" onchange="adminOverrideAttendance('${escapeHTML(r.className)}', '${escapeHTML(r.date)}', this.value)">
                                        <option value="">-- set --</option>
                                        <option value="present">Present</option>
                                        <option value="late">Late</option>
                                        <option value="absent">Absent</option>
                                        <option value="excused">Excused</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        }

        function adminOverrideAttendance(className, date, newStatus) {
            if (!newStatus) return;
            const dept = TEACHER_DEPARTMENTS[sessionUser.username];
            const firstStudent = Object.values(USER_DATABASE).find(u => u.role === 'student' && u.department === dept);
            if (!firstStudent) return;
            attendanceOverrides[`${firstStudent.studentId}-${className}-${date}`] = newStatus;
            localStorage.setItem('taptrackAttendanceOverrides', JSON.stringify(attendanceOverrides));
            logAudit('ATTENDANCE_OVERRIDE', `${className} ${date} → ${newStatus}`);
            alert(`✅ Override applied to ${firstStudent.name}'s record for ${className} on ${date}.`);
        }

        function exportDeptAuditCSV() {
            const dept = TEACHER_DEPARTMENTS[sessionUser.username];
            const subjects = STUDENT_DEPARTMENT_SUBJECTS[dept] || [];
            const records = STUDENT_ATTENDANCE_RECORDS.filter(r => subjects.includes(r.className));
            const rows = [['Class', 'Date', 'Status']];
            records.forEach(r => rows.push([r.className, r.date, r.status]));
            const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dept-audit-${dept}-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            logAudit('DEPT_AUDIT_EXPORT', `${dept} audit exported`);
        }
