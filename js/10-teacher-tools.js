        function cancelCurrentClass() {
            currentClassCancelled = true;
            const notice = document.getElementById('class-notice');
            notice.innerText = 'Current class cancelled. The next class is Mathematics at 10:00 AM.';
            notice.style.display = 'block';
            publishAnnouncement('Faculty notice: The current class has been cancelled. The next class is Mathematics at 10:00 AM.');
        }

        function announceNextClass() {
            const nextClassMessage = currentClassCancelled
                ? 'Next class reminder: Mathematics begins at 10:00 AM.'
                : 'Next class reminder: Computer Science begins at 8:00 AM.';
            publishAnnouncement(nextClassMessage);
            const notice = document.getElementById('class-notice');
            notice.innerText = nextClassMessage;
            notice.style.display = 'block';
        }

        function renderAssignedSchedule() {
            const assignedSchedule = ASSIGNED_SCHEDULES[sessionUser.username] || ASSIGNED_SCHEDULES.faculty1;
            const heading = document.getElementById('schedule-heading');
            const schedule = document.getElementById('assigned-schedule');
            if (!schedule) return;
            heading.innerText = sessionUser.role === 'faculty' ? 'Faculty Schedule Overview' : 'My Assigned Schedule';
            schedule.innerHTML = assignedSchedule.map(item => {
                const room = getEffectiveRoom(item);
                const notice = getRoomScheduleNotice(item);
                return `<li>
                    <span>
                        <strong>${escapeHTML(item.day)}</strong> - ${escapeHTML(item.className)}
                        <small style="color:#8b9bc7;"> (${escapeHTML(room)}, ${getEnrollmentCount(item.className)} students)</small>
                        ${notice}
                    </span>
                    <span class="schedule-time">${escapeHTML(item.time)} – ${escapeHTML(item.endTime || '')}</span>
                </li>`;
            }).join('');
        }

        function findAvailableRoomForTeacher(item) {
            const currentDepartment = ROOM_DEPARTMENTS[getEffectiveRoom(item)] || CLASS_DEPARTMENTS[item.className];
            return FACULTY_ROOMS
                .filter(room => {
                    const layout = roomLayout[room] || {};
                    if (layout.status === 'occasion') return false;
                    if (isRoomBusyAtTime(room, item)) return false;
                    return true;
                })
                .sort((a, b) => {
                    const aDept = ROOM_DEPARTMENTS[a] === currentDepartment ? 0 : 1;
                    const bDept = ROOM_DEPARTMENTS[b] === currentDepartment ? 0 : 1;
                    if (aDept !== bDept) return aDept - bDept;
                    const aTemp = roomLayout[a]?.temporaryClass ? 1 : 0;
                    const bTemp = roomLayout[b]?.temporaryClass ? 1 : 0;
                    if (aTemp !== bTemp) return aTemp - bTemp;
                    const aStatus = roomLayout[a]?.status === 'available' ? 0 : 1;
                    const bStatus = roomLayout[b]?.status === 'available' ? 0 : 1;
                    return aStatus - bStatus;
                })[0] || '';
        }

        function requestTeacherRoomMove(className) {
            if (sessionUser?.role !== 'teacher') return;
            const item = (ASSIGNED_SCHEDULES[sessionUser.username] || []).find(s => s.className === className);
            if (!item) return;
            const currentRoom = getEffectiveRoom(item);
            if (roomLayout[currentRoom]?.status !== 'occasion') {
                alert(`${className} does not need a room change right now.`);
                return;
            }
            const temporaryRoom = findAvailableRoomForTeacher(item);
            if (!temporaryRoom) {
                const busyRooms = FACULTY_ROOMS.filter(r => {
                    const layout = roomLayout[r] || {};
                    return layout.status === 'occasion' || isRoomBusyAtTime(r, item);
                });
                alert(`No classroom is available for ${className} at ${item.day} ${item.time}–${item.endTime}.\n\nBlocked rooms (${busyRooms.length}): ${busyRooms.join(', ') || 'none'}`);
                return;
            }
            const department = ROOM_DEPARTMENTS[temporaryRoom] || 'General Faculty';
            const accepted = window.confirm(`${className} (${item.day}, ${item.time}–${item.endTime}) needs a temporary room.\n\nMove to: ${temporaryRoom} (${department})?`);
            if (!accepted) return;
            Object.values(roomLayout).forEach(l => {
                if (l.temporaryClass === className) l.temporaryClass = '';
            });
            roomLayout[temporaryRoom] = roomLayout[temporaryRoom] || { status: 'available', scheduledClass: '', temporaryClass: '' };
            roomLayout[temporaryRoom].temporaryClass = className;
            roomLayout[temporaryRoom].status = 'scheduled';
            localStorage.setItem('taptrackDeanRoomLayout', JSON.stringify(roomLayout));
            logAudit('ROOM_MOVE', `${className} → ${temporaryRoom}`);
            renderAssignedSchedule();
            window.dispatchEvent(new Event('taptrack-room-update'));
        }
