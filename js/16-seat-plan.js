        function selectAttendanceStatus(status) {
            selectedAttendanceStatus = status;
            document.querySelectorAll('.status-option').forEach(o => o.classList.toggle('selected', o.dataset.status === status));
        }

        function renderSeatingGrid() {
            const grid = document.getElementById('classroom-seating-grid');
            if (!grid) return;
            grid.innerHTML = '';
            seatingPlanMatrix.forEach((row, rowIndex) => row.forEach((seatData, columnIndex) => {
                const seat = document.createElement('button');
                const status = seatData ? seatData.status : 'empty';
                seat.className = `seat ${status}`;
                seat.type = 'button';
                const studentNames = seatData ? seatData.names || [seatData.name] : [];
                seat.innerHTML = studentNames.length
                    ? `${studentNames.join('<br>')}<br><small>${status.toUpperCase()}</small>`
                    : `Seat ${rowIndex * 5 + columnIndex + 1}<br><small>EMPTY</small>`;
                seat.onclick = () => applySeatStatus(rowIndex, columnIndex);
                seat.ondragover = e => { e.preventDefault(); seat.classList.add('drop-target'); };
                seat.ondragleave = () => seat.classList.remove('drop-target');
                seat.ondrop = e => {
                    e.preventDefault();
                    seat.classList.remove('drop-target');
                    assignStudentToSeat(draggedStudentName, rowIndex, columnIndex);
                };
                grid.appendChild(seat);
            }));
            renderStudentRoster();
            document.getElementById('present-count').innerText = seatingPlanMatrix.flat().filter(s => s && s.status === 'present').length;
        }

        function renderStudentRoster() {
            const roster = document.getElementById('student-roster');
            if (!roster) return;
            const assignedNames = new Set(Object.keys(permanentSeatAssignments));
            const unassigned = getActiveRoster().filter(n => !assignedNames.has(n));
            roster.innerHTML = unassigned.length
                ? unassigned.map(n => `<div class="draggable-student" draggable="true" data-student="${n}">${n}</div>`).join('')
                : '<p>All students have a permanent seat.</p>';
            roster.querySelectorAll('.draggable-student').forEach(s => {
                s.ondragstart = () => { draggedStudentName = s.dataset.student; };
                s.ondragend = () => { draggedStudentName = null; };
            });
        }

        function assignStudentToSeat(studentName, rowIndex, columnIndex) {
            if (!studentName || !getActiveRoster().includes(studentName) || seatingPlanMatrix[rowIndex][columnIndex]) return;
            seatingPlanMatrix[rowIndex][columnIndex] = { names: [studentName], status: 'present' };
            permanentSeatAssignments[studentName] = { rowIndex, columnIndex };
            draggedStudentName = null;
            saveSeatPlan();
            renderSeatingGrid();
        }

        function resetSemesterSeatPlan() {
            if (!confirm('Reset all permanent seat assignments for the new semester?')) return;
            seatingPlanMatrix = Array(5).fill(null).map(() => Array(5).fill(null));
            permanentSeatAssignments = {};
            seatPlansByClass = {};
            assignmentsByClass = {};
            localStorage.removeItem('taptrackSeatPlan');
            renderSeatingGrid();
        }

        function loadSavedSeatPlan() {
            const savedPlan = localStorage.getItem('taptrackSeatPlan');
            if (!savedPlan) return;
            try {
                const parsed = JSON.parse(savedPlan);
                if (parsed.plans && parsed.assignmentsByClass) {
                    seatPlansByClass = parsed.plans;
                    assignmentsByClass = parsed.assignmentsByClass;
                }
            } catch { localStorage.removeItem('taptrackSeatPlan'); }
        }

        function saveSeatPlan() {
            if (selectedSeatPlanClass) {
                seatPlansByClass[selectedSeatPlanClass] = seatingPlanMatrix;
                assignmentsByClass[selectedSeatPlanClass] = permanentSeatAssignments;
            }
            localStorage.setItem('taptrackSeatPlan', JSON.stringify({ plans: seatPlansByClass, assignmentsByClass }));
        }

        function getActiveRoster() {
            const department = CLASS_DEPARTMENTS[selectedSeatPlanClass];
            const departmentRoster = Object.values(USER_DATABASE)
                .filter(u => u.role === 'student' && u.department === department)
                .map(u => u.name);
            if (departmentRoster.length) return departmentRoster;
            const rotation = [...selectedSeatPlanClass].reduce((t, c) => t + c.charCodeAt(0), 0) % SEAT_ROSTER.length;
            const rotated = [...SEAT_ROSTER.slice(rotation), ...SEAT_ROSTER.slice(0, rotation)];
            return rotated.slice(0, getEnrollmentCount(selectedSeatPlanClass));
        }

        function loadClassSeatPlan(className) {
            saveSeatPlan();
            selectedSeatPlanClass = className;
            seatingPlanMatrix = seatPlansByClass[className] || Array(5).fill(null).map(() => Array(5).fill(null));
            permanentSeatAssignments = assignmentsByClass[className] || {};
            normalizeSeatPlanForRoster();
            document.getElementById('enrollment-count').innerText = getEnrollmentCount(className);
            renderSeatingGrid();
        }

        function normalizeSeatPlanForRoster() {
            const activeNames = new Set(getActiveRoster());
            seatingPlanMatrix = seatingPlanMatrix.map(row => row.map(seat => {
                if (!seat) return null;
                const names = (seat.names || [seat.name]).filter(n => activeNames.has(n));
                return names.length ? { names, status: seat.status } : null;
            }));
            permanentSeatAssignments = Object.fromEntries(Object.entries(permanentSeatAssignments).filter(([n]) => activeNames.has(n)));
        }

        function applySeatStatus(rowIndex, columnIndex) {
            const currentSeat = seatingPlanMatrix[rowIndex][columnIndex];
            if (selectedAttendanceStatus === 'empty') {
                if (currentSeat) (currentSeat.names || [currentSeat.name]).forEach(n => delete permanentSeatAssignments[n]);
                seatingPlanMatrix[rowIndex][columnIndex] = null;
            } else {
                if (!currentSeat) return;
                seatingPlanMatrix[rowIndex][columnIndex] = { names: currentSeat.names || [currentSeat.name], status: selectedAttendanceStatus };
            }
            saveSeatPlan();
            renderSeatingGrid();
        }
