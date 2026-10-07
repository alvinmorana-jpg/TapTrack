        function getAdminSummaryStats() {
            const allStudents = Object.values(USER_DATABASE).filter(u => u.role === 'student');
            const overallEnrollments = allStudents.length;
            const latestFacultySubmission = facultyAdminSubmissions[0];
            const reportedTotal = latestFacultySubmission ? latestFacultySubmission.enrolled
                : submittedAttendanceReports.reduce((s, r) => s + (r.totalStudents || 0), 0);
            const previewYear = Math.max(20, Math.round(reportedTotal * 1.1));
            const totalGraduates = Math.max(6, Math.round(reportedTotal * 0.18));
            const totalDrops = Math.max(2, Math.round(reportedTotal * 0.07));
            return { overallEnrollments, previewYear, totalGraduates, totalDrops, reportedTotal };
        }

        function renderAdminSummary() {
            const container = document.getElementById('admin-summary-cards');
            if (!container) return;
            const stats = getAdminSummaryStats();
            container.innerHTML = `
                <div class="stat-card"><strong>${stats.overallEnrollments}</strong><span>Overall Enrolled</span></div>
                <div class="stat-card"><strong>${stats.previewYear}</strong><span>Last Year Enrolled</span></div>
                <div class="stat-card"><strong>${stats.totalGraduates}</strong><span>Total Graduates</span></div>
                <div class="stat-card"><strong>${stats.totalDrops}</strong><span>Total Drops</span></div>
            `;
            const chart = document.getElementById('admin-summary-chart');
            if (!chart) return;
            const values = [stats.overallEnrollments, stats.previewYear, stats.totalGraduates, stats.totalDrops];
            const max = Math.max(1, ...values);
            const labels = [
                { label: 'Enrolled', color: 'present', value: stats.overallEnrollments },
                { label: 'Last Year', color: 'late', value: stats.previewYear },
                { label: 'Graduates', color: 'present', value: stats.totalGraduates },
                { label: 'Drops', color: 'absent', value: stats.totalDrops }
            ];
            chart.innerHTML = `<div class="bar-chart">${labels.map(item => `
                <div class="bar-row">
                    <span class="bar-label">${item.label}</span>
                    <div class="bar-track"><div class="bar-fill ${item.color}" style="width:${(item.value / max) * 100}%"></div></div>
                    <span class="chart-total">${item.value}</span>
                </div>`).join('')}</div>`;
        }

        function refreshAdminDashboard() {
            if (sessionUser?.role !== 'admin') return;
            facultyAdminSubmissions = readStorage('taptrackFacultyAdminSubmissions', []);
            submittedAttendanceReports = readStorage('taptrackAttendanceReports', []);
            renderAdminSummary();
            renderFacultyAdminSubmissions();
        }
