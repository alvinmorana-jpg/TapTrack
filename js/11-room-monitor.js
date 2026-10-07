        function updateDeanRoom(room, property, value) {
            if (sessionUser?.role !== 'faculty' || !FACULTY_ROOMS.includes(room)) return;
            if (property === 'status' && value === 'occasion') {
                occasionEditingRoom = room;
                openOccasionModal(room);
                return;
            }
            stageRoomChange(room, property, value);
            renderRoomMonitor();
        }

        function stageRoomChange(room, property, value) {
            if (!pendingRoomChanges[room]) {
                const current = roomLayout[room] || { status: 'available', scheduledClass: '', temporaryClass: '' };
                pendingRoomChanges[room] = { ...current };
            }
            pendingRoomChanges[room][property] = value;
            if (property === 'temporaryClass' && value) pendingRoomChanges[room].status = 'scheduled';
            updateBroadcastBadge();
        }

        function updateBroadcastBadge() {
            const count = Object.keys(pendingRoomChanges).length;
            const badge = document.getElementById('broadcast-pending-badge');
            if (!badge) return;
            if (count > 0) {
                badge.style.display = 'inline-block';
                badge.textContent = count;
            } else {
                badge.style.display = 'none';
            }
        }

        function openOccasionModal(room) {
            const modal = document.getElementById('occasion-modal');
            const existing = pendingRoomChanges[room]?.occasionDetails || roomLayout[room]?.occasionDetails || {};
            document.getElementById('occasion-reason').value = existing.reason || '';
            document.getElementById('occasion-date').value = existing.date || new Date().toISOString().slice(0, 10);
            document.getElementById('occasion-start').value = existing.start || '';
            document.getElementById('occasion-end').value = existing.end || '';
            document.getElementById('occasion-duration-type').value = existing.durationType || 'hours';
            toggleOccasionTimeFields();
            modal.style.display = 'flex';
        }

        function closeOccasionModal() {
            document.getElementById('occasion-modal').style.display = 'none';
            occasionEditingRoom = null;
        }

        function toggleOccasionTimeFields() {
            const type = document.getElementById('occasion-duration-type').value;
            document.getElementById('occasion-time-fields').style.display = type === 'hours' ? 'grid' : 'none';
        }

        document.getElementById('occasion-duration-type')?.addEventListener('change', toggleOccasionTimeFields);

        document.getElementById('occasion-cancel-btn')?.addEventListener('click', () => {
            closeOccasionModal();
            renderRoomMonitor();
        });

        document.getElementById('occasion-save-btn')?.addEventListener('click', () => {
            if (!occasionEditingRoom) return;
            const reason = document.getElementById('occasion-reason').value.trim();
            const date = document.getElementById('occasion-date').value;
            const durationType = document.getElementById('occasion-duration-type').value;
            const start = document.getElementById('occasion-start').value.trim();
            const end = document.getElementById('occasion-end').value.trim();

            if (!reason || !date) { alert('Please enter at least a reason and a date.'); return; }
            if (durationType === 'hours' && (!start || !end)) { alert('Please enter both a start and end time (or choose "Whole day").'); return; }

            if (!pendingRoomChanges[occasionEditingRoom]) {
                const current = roomLayout[occasionEditingRoom] || { status: 'available', scheduledClass: '', temporaryClass: '' };
                pendingRoomChanges[occasionEditingRoom] = { ...current };
            }
            pendingRoomChanges[occasionEditingRoom].status = 'occasion';
            pendingRoomChanges[occasionEditingRoom].occasionDetails = {
                reason, date, durationType,
                start: durationType === 'hours' ? start : '',
                end: durationType === 'hours' ? end : '',
            };

            updateBroadcastBadge();
            renderRoomMonitor();
            closeOccasionModal();
        });

        function broadcastRoomUpdates() {
            if (sessionUser?.role !== 'faculty') return;
            const changes = Object.keys(pendingRoomChanges);
            if (changes.length === 0) {
                alert('No pending changes to broadcast.\n\nAdjust a room first, then press Broadcast.');
                return;
            }
            const classItems = [...new Map(WEEKLY_CLASS_SCHEDULE.map(i => [i.className, i])).values()];
            const batchAssignments = [];
            const autoMoved = [];
            const autoFailed = [];

            changes.forEach(room => {
                const change = pendingRoomChanges[room];
                if (change.status !== 'occasion') return;
                const affectedClasses = classItems.filter(item => getEffectiveRoom(item) === room);
                affectedClasses.forEach(item => {
                    const alreadyTemp = FACULTY_ROOMS.some(r =>
                        (roomLayout[r]?.temporaryClass === item.className) ||
                        (pendingRoomChanges[r]?.temporaryClass === item.className)
                    );
                    if (alreadyTemp) return;
                    const itemStart = parseTimeToMinutes(item.time);
                    const itemEnd = parseTimeToMinutes(item.endTime);
                    const candidate = FACULTY_ROOMS
                        .filter(r => {
                            if (r === room) return false;
                            const layout = pendingRoomChanges[r] || roomLayout[r] || {};
                            if (layout.status === 'occasion') return false;
                            if (isRoomBusyAtTime(r, item)) return false;
                            const batchConflict = batchAssignments.some(a =>
                                a.room === r && a.day === item.day &&
                                timesOverlap(itemStart, itemEnd, a.start, a.end)
                            );
                            return !batchConflict;
                        })
                        .sort((a, b) => {
                            const aDept = ROOM_DEPARTMENTS[a] === CLASS_DEPARTMENTS[item.className] ? 0 : 1;
                            const bDept = ROOM_DEPARTMENTS[b] === CLASS_DEPARTMENTS[item.className] ? 0 : 1;
                            return aDept - bDept;
                        })[0];
                    if (!candidate) { autoFailed.push(item.className); return; }
                    batchAssignments.push({ room: candidate, day: item.day, start: itemStart, end: itemEnd });
                    if (!pendingRoomChanges[candidate]) {
                        const cur = roomLayout[candidate] || { status: 'available', scheduledClass: '', temporaryClass: '' };
                        pendingRoomChanges[candidate] = { ...cur };
                    }
                    pendingRoomChanges[candidate].temporaryClass = item.className;
                    pendingRoomChanges[candidate].status = 'scheduled';
                    autoMoved.push(`${item.className} → ${candidate}`);
                });
            });

            Object.keys(pendingRoomChanges).forEach(room => {
                roomLayout[room] = { ...(roomLayout[room] || {}), ...pendingRoomChanges[room] };
            });

            localStorage.setItem('taptrackDeanRoomLayout', JSON.stringify(roomLayout));
            logAudit('BROADCAST', `${changes.length} room changes`);
            pendingRoomChanges = {};
            updateBroadcastBadge();
            renderRoomMonitor();
            renderAssignedSchedule();
            window.dispatchEvent(new Event('taptrack-room-update'));

            const msgEl = document.getElementById('room-auto-assign-message');
            const parts = [`📡 Broadcast sent to all terminals.`];
            if (autoMoved.length) parts.push(`Auto-relocated ${autoMoved.length} class${autoMoved.length === 1 ? '' : 'es'}: ${autoMoved.join('; ')}`);
            if (autoFailed.length) parts.push(`⚠️ Could not relocate: ${autoFailed.join(', ')}`);
            msgEl.innerText = parts.join(' • ');
        }

        // The room's default state: scheduled if a class is assigned to it, otherwise available
        function getOriginalRoomLayout(room) {
            const scheduledClass = Object.keys(ROOM_ASSIGNMENTS).find(c => ROOM_ASSIGNMENTS[c] === room) || '';
            return { status: scheduledClass ? 'scheduled' : 'available', scheduledClass, temporaryClass: '' };
        }

        function isRoomOriginal(layout, room) {
            const original = getOriginalRoomLayout(room);
            return Boolean(layout) &&
                layout.status === original.status &&
                !layout.temporaryClass &&
                !layout.occasionDetails;
        }

        // "Back to Normal": undo temporary rooms, occasions AND "No class" so every class resumes
        function resetTemporaryRooms() {
            if (sessionUser?.role !== 'faculty') return;

            const changedRooms = FACULTY_ROOMS.filter(room => !isRoomOriginal(roomLayout[room], room));
            const pendingRooms = Object.keys(pendingRoomChanges);
            const totalAffected = new Set([...changedRooms, ...pendingRooms]).size;

            if (totalAffected === 0) {
                alert('Nothing to reset. All classrooms are already in their original state.');
                return;
            }

            const confirmed = window.confirm(
                `Return ${totalAffected} room${totalAffected === 1 ? '' : 's'} to normal?\n\n` +
                `This will:\n` +
                `• Resume all classes set to "No class"\n` +
                `• Remove all occasion reservations\n` +
                `• Remove all temporary class assignments\n` +
                `• Discard any pending (unbroadcast) room changes\n\n` +
                `This action cannot be undone.`
            );

            if (!confirmed) return;

            let resetCount = 0;
            FACULTY_ROOMS.forEach(room => {
                if (!isRoomOriginal(roomLayout[room], room)) resetCount++;
                roomLayout[room] = getOriginalRoomLayout(room);
            });

            pendingRoomChanges = {};

            localStorage.setItem('taptrackDeanRoomLayout', JSON.stringify(roomLayout));
            logAudit('ROOMS_RESET', `${resetCount} room(s) returned to normal`);

            updateBroadcastBadge();
            renderRoomMonitor();
            renderAssignedSchedule();
            window.dispatchEvent(new Event('taptrack-room-update'));

            const msgEl = document.getElementById('room-auto-assign-message');
            if (msgEl) {
                msgEl.innerText = `↩️ Back to normal. ${resetCount} room${resetCount === 1 ? '' : 's'} restored - all classes resume.`;
            }
        }

        function renderRoomMonitor() {
            const monitor = document.getElementById('room-monitor');
            if (!monitor) return;
            const schedule = ASSIGNED_SCHEDULES.faculty1;
            const classOptions = [...new Map(schedule.map(i => [i.className, i])).values()];
            const counts = { scheduled: 0, available: 0, occasion: 0 };
            monitor.innerHTML = FACULTY_ROOMS.map(room => {
                const committed = roomLayout[room] || { status: 'available', scheduledClass: '', temporaryClass: '' };
                const pending = pendingRoomChanges[room];
                const layout = pending ? { ...committed, ...pending } : committed;
                const status = layout.status || 'available';
                const isPending = Boolean(pending);
                counts[status] += 1;
                const assignedClass = classOptions.find(i => i.className === (layout.temporaryClass || layout.scheduledClass));
                const roomClassCount = new Set(schedule.filter(i => getEffectiveRoom(i) === room).map(i => i.className)).size;
                let occasionInfo = '';
                if (status === 'occasion' && layout.occasionDetails) {
                    const d = layout.occasionDetails;
                    const timeStr = d.durationType === 'allday' ? 'Whole day' : `${d.start} – ${d.end}`;
                    occasionInfo = `<div style="margin-top:8px; padding:9px 11px; background:rgba(255,46,151,0.12); border-left:3px solid #ff2e97; border-radius:6px; font-size:12px; color:#ff2e97;">
                        <strong>${escapeHTML(d.reason)}</strong><br>
                        <span style="color:#8b9bc7;">📅 ${escapeHTML(d.date)} &nbsp;•&nbsp; ⏱ ${escapeHTML(timeStr)}</span>
                    </div>`;
                }
                const assignmentText = status === 'occasion'
                    ? `Reserved for an occasion. All ${roomClassCount} scheduled class${roomClassCount === 1 ? '' : 'es'} using this room are affected.`
                    : assignedClass
                        ? `${assignedClass.className} with ${getTeacherName(assignedClass.teacher)} - ${assignedClass.day}, ${assignedClass.time}`
                        : 'No class is using this room';
                const pendingTag = isPending
                    ? `<span style="background:#ffb020; color:#0f1535; font-size:9px; font-weight:800; letter-spacing:1px; padding:3px 8px; border-radius:20px; margin-left:8px;">🔴 PENDING</span>`
                    : '';
                const roomId = room.replace(/\s/g, '-');
                return `<div class="room-card room-${status}" data-department="${ROOM_DEPARTMENTS[room] || 'Faculty'}" data-room="${room}" style="${isPending ? 'border-color:rgba(255,176,32,0.5); box-shadow:0 0 20px rgba(255,176,32,0.15);' : ''}">
                    <div class="room-card-header"><h3>${room}${pendingTag}</h3><strong>${ROOM_DEPARTMENTS[room] || 'Faculty'}</strong></div>
                    <p>${assignmentText}</p>
                    ${occasionInfo}
                    <div class="room-controls" style="margin-top:12px;">
                        <label class="room-control-label" for="room-status-${roomId}">Dean room status</label>
                        <select id="room-status-${roomId}" class="room-status" onchange="updateDeanRoom('${room}', 'status', this.value)">
                            <option value="available" ${status === 'available' ? 'selected' : ''}>Gray - No class</option>
                            <option value="scheduled" ${status === 'scheduled' ? 'selected' : ''}>Green - School schedule</option>
                            <option value="occasion" ${status === 'occasion' ? 'selected' : ''}>Red - Occasion</option>
                        </select>
                        <label class="room-control-label" for="temporary-room-${roomId}">Temporary room assignment</label>
                        <select id="temporary-room-${roomId}" class="temporary-room-select" onchange="updateDeanRoom('${room}', 'temporaryClass', this.value)">
                            <option value="">No temporary class</option>
                            ${classOptions.map(i => `<option value="${escapeHTML(i.className)}" ${layout.temporaryClass === i.className ? 'selected' : ''}>${escapeHTML(i.className)} - ${i.day}, ${i.time}–${i.endTime}</option>`).join('')}
                        </select>
                    </div>
                </div>`;
            }).join('');
            document.getElementById('room-status-summary').innerText = `${counts.scheduled} scheduled, ${counts.available} available, ${counts.occasion} reserved for occasions`;
            filterRooms(document.getElementById('room-search').value);
        }

        function filterRooms(searchText) {
            const query = searchText.trim().toLowerCase();
            const department = document.getElementById('room-department-filter').value;
            let visibleRooms = 0;
            document.querySelectorAll('.room-card').forEach(card => {
                const matchesDept = department === 'all' || card.dataset.department === department;
                const matchesSearch = !query || card.innerText.toLowerCase().includes(query);
                const matches = matchesDept && matchesSearch;
                card.style.display = matches ? 'block' : 'none';
                if (matches) visibleRooms += 1;
            });
            document.getElementById('room-empty-search').style.display = visibleRooms ? 'none' : 'block';
        }
