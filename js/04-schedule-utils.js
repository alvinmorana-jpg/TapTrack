        function parseTimeToMinutes(timeStr) {
            if (!timeStr) return 0;
            const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(timeStr).trim());
            if (!match) return 0;
            let hh = parseInt(match[1], 10);
            const mm = parseInt(match[2], 10);
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && hh !== 12) hh += 12;
            if (ampm === 'AM' && hh === 12) hh = 0;
            return hh * 60 + mm;
        }

        function timesOverlap(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }

        function getClassDuration(item) {
            const start = parseTimeToMinutes(item.time);
            const end = parseTimeToMinutes(item.endTime);
            if (!end || end <= start) return 60;
            return end - start;
        }

        function getEffectiveRoom(item) {
            const temporaryRoom = FACULTY_ROOMS.find(room => {
                const layout = roomLayout[room];
                return layout && layout.temporaryClass === item.className && layout.status !== 'occasion';
            });
            if (temporaryRoom) return temporaryRoom;
            return ROOM_ASSIGNMENTS[item.className] || item.room || 'TBA';
        }

        function isRoomBusyAtTime(room, item) {
            const itemDay = item.day;
            const itemStart = parseTimeToMinutes(item.time);
            const itemEnd = parseTimeToMinutes(item.endTime);
            const conflict = WEEKLY_CLASS_SCHEDULE.find(other => {
                if (other.className === item.className) return false;
                if (other.day !== itemDay) return false;
                if (getEffectiveRoom(other) !== room) return false;
                return timesOverlap(itemStart, itemEnd, parseTimeToMinutes(other.time), parseTimeToMinutes(other.endTime));
            });
            return Boolean(conflict);
        }
