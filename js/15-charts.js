        function renderAttendanceCharts() {
            const roomSelector = document.getElementById('chart-room-selector');
            if (!roomSelector) return;
            const rooms = [...new Set(Object.values(ROOM_ASSIGNMENTS))].sort();
            roomSelector.innerHTML = rooms.map(r => `<option value="${r}">${r}</option>`).join('');
            renderRoomWeekChart();
            renderDepartmentSemesterChart();
        }

        function reportForClass(className) {
            return submittedAttendanceReports.filter(r => r.subject === className)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }

        function renderRoomWeekChart() {
            const room = document.getElementById('chart-room-selector').value;
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const roomReports = submittedAttendanceReports.filter(r => (ROOM_ASSIGNMENTS[r.subject] || '') === room);
            const rows = days.map(day => {
                const classes = WEEKLY_CLASS_SCHEDULE.filter(i => i.day === day && (ROOM_ASSIGNMENTS[i.className] || i.room) === room);
                const totals = classes.reduce((s, i) => {
                    const report = reportForClass(i.className);
                    if (report) {
                        s.present += report.counts.present || 0;
                        s.absent += report.counts.absent || 0;
                        s.late += report.counts.late || 0;
                    }
                    return s;
                }, { present: 0, absent: 0, late: 0 });
                return { day, ...totals };
            });
            const max = Math.max(1, ...rows.flatMap(r => [r.present, r.absent, r.late]));
            document.getElementById('room-week-chart').innerHTML = roomReports.length
                ? `<div class="chart-summary"><div><strong>${rows.reduce((t, r) => t + r.present, 0)}</strong>Present</div><div><strong>${rows.reduce((t, r) => t + r.absent, 0)}</strong>Absent</div><div><strong>${rows.reduce((t, r) => t + r.late, 0)}</strong>Late</div><div><strong>${roomReports.length}</strong>Reports</div></div><div class="bar-chart">${rows.map(r => `<div class="bar-row"><span class="bar-label">${r.day}</span><div class="bar-track"><div class="bar-fill present" style="width:${r.present / max * 100}%"></div><div class="bar-fill absent" style="width:${r.absent / max * 100}%"></div><div class="bar-fill late" style="width:${r.late / max * 100}%"></div></div><span class="chart-total">${r.present + r.absent + r.late}</span></div>`).join('')}</div>`
                : '<p class="chart-empty">No submitted attendance reports for this room yet.</p>';
        }

        function renderDepartmentSemesterChart() {
            const selectedDepartment = document.getElementById('chart-department-selector').value;
            const reports = submittedAttendanceReports.filter(r => selectedDepartment === 'all' || CLASS_DEPARTMENTS[r.subject] === selectedDepartment);
            const totals = reports.reduce((s, r) => {
                s.present += r.counts.present || 0;
                s.absent += r.counts.absent || 0;
                s.late += r.counts.late || 0;
                s.excused += r.counts.excused || 0;
                return s;
            }, { present: 0, absent: 0, late: 0, excused: 0 });
            const max = Math.max(1, totals.present, totals.absent, totals.late, totals.excused);
            document.getElementById('department-semester-chart').innerHTML = reports.length
                ? `<div class="chart-summary"><div><strong>${totals.present}</strong>Present</div><div><strong>${totals.absent}</strong>Absent</div><div><strong>${totals.late}</strong>Late</div><div><strong>${reports.length}</strong>Reports</div></div><div class="bar-chart"><div class="bar-row"><span class="bar-label">Present</span><div class="bar-track"><div class="bar-fill present" style="width:${totals.present / max * 100}%"></div></div><span class="chart-total">${totals.present}</span></div><div class="bar-row"><span class="bar-label">Absent</span><div class="bar-track"><div class="bar-fill absent" style="width:${totals.absent / max * 100}%"></div></div><span class="chart-total">${totals.absent}</span></div><div class="bar-row"><span class="bar-label">Late</span><div class="bar-track"><div class="bar-fill late" style="width:${totals.late / max * 100}%"></div></div><span class="chart-total">${totals.late}</span></div><div class="bar-row"><span class="bar-label">Excused</span><div class="bar-track"><div class="bar-fill" style="background:linear-gradient(90deg,#a855f7,#3b82f6);width:${totals.excused / max * 100}%"></div></div><span class="chart-total">${totals.excused}</span></div></div>`
                : '<p class="chart-empty">No submitted reports for this department yet.</p>';
        }
