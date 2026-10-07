        function renderAttendanceReviewClasses() {
            const classSelect = document.getElementById('attendance-review-class');
            if (!classSelect) return;
            const classes = [...new Set(WEEKLY_CLASS_SCHEDULE.map(item => item.className))];
            classSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
        }

        function submitAttendanceReview() {
            const date = document.getElementById('attendance-review-date').value;
            const className = document.getElementById('attendance-review-class').value;
            const reason = document.getElementById('attendance-review-reason').value.trim();
            const proof = document.getElementById('attendance-proof').files[0];
            const message = document.getElementById('attendance-review-message');
            if (!date || !reason || !proof) {
                message.innerText = 'Please select a date, explain the absence, and attach an image of proof.';
                message.style.color = '#ff2e97';
                message.style.display = 'block';
                return;
            }
            const dueDate = new Date(`${date}T23:59:59`);
            dueDate.setDate(dueDate.getDate() + 5);
            const reader = new FileReader();
            reader.onload = () => {
                attendanceReviewRequests.push({
                    id: Date.now(), studentId: sessionUser.studentId, studentName: sessionUser.name,
                    date, className, reason, proofName: proof.name, proofData: reader.result,
                    dueDate: dueDate.toISOString(), status: 'pending'
                });
                localStorage.setItem('taptrackAttendanceReviews', JSON.stringify(attendanceReviewRequests));
                message.innerText = 'Review submitted. Your teacher has 5 days to review it.';
                message.style.color = '#00ff9d';
                message.style.display = 'block';
                document.getElementById('attendance-review-reason').value = '';
                document.getElementById('attendance-proof').value = '';
            };
            reader.readAsDataURL(proof);
        }

        function renderTeacherReviewRequests() {
            const list = document.getElementById('teacher-review-list');
            if (!list) return;
            const assignedSubjects = new Set((ASSIGNED_SCHEDULES[sessionUser.username] || []).map(i => i.className));
            const pendingRequests = attendanceReviewRequests.filter(r => r.status === 'pending' && assignedSubjects.has(r.className));
            list.innerHTML = pendingRequests.length ? pendingRequests.map(r => `
                <div class="review-card">
                    <h3>${r.studentName} - ${r.className}</h3>
                    <p><strong>Absent date:</strong> ${r.date}</p>
                    <p><strong>Reason:</strong> ${r.reason}</p>
                    <p><strong>Proof:</strong> ${r.proofName}</p>
                    <img class="review-proof" src="${r.proofData}" alt="Proof">
                    <p><strong>Review by:</strong> ${new Date(r.dueDate).toLocaleDateString()}</p>
                    <div class="review-actions">
                        <button class="quick-action ripple" onclick="resolveAttendanceReview(${r.id}, 'approved')">Approve and Mark Present</button>
                        <button class="quick-action reject-review ripple" onclick="resolveAttendanceReview(${r.id}, 'rejected')">Reject Request</button>
                    </div>
                </div>
            `).join('') : '<p class="review-empty">No pending attendance review requests.</p>';
        }

        function resolveAttendanceReview(requestId, decision) {
            const request = attendanceReviewRequests.find(i => i.id === requestId);
            if (!request) return;
            request.status = decision;
            request.reviewedBy = sessionUser.name;
            if (decision === 'approved') {
                attendanceOverrides[`${request.studentId}-${request.className}-${formatAttendanceDate(request.date)}`] = 'present';
                localStorage.setItem('taptrackAttendanceOverrides', JSON.stringify(attendanceOverrides));
            }
            localStorage.setItem('taptrackAttendanceReviews', JSON.stringify(attendanceReviewRequests));
            logAudit('REVIEW_' + decision.toUpperCase(), `${request.studentName} ${request.className}`);
            renderTeacherReviewRequests();
        }

        function formatAttendanceDate(isoDate) {
            const date = new Date(`${isoDate}T12:00:00`);
            return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        }
