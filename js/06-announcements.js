        function renderAnnouncements(targetId) {
            const target = document.getElementById(targetId);
            if (!target) return;
            const viewer = targetId === 'student-announcements' ? 'student' : targetId === 'staff-announcements' ? 'teacher' : 'all';
            target.innerHTML = announcementsList.filter(a => {
                const audience = typeof a === 'string' ? 'all' : a.audience;
                return audience === 'all' || audience === viewer;
            }).map(a => {
                const message = typeof a === 'string' ? a : a.message;
                return `<div class="announcement-box">${escapeHTML(message)}</div>`;
            }).join('');
        }

        function publishAnnouncement(message, audience = 'all') {
            announcementsList.unshift({ message, audience });
            renderAnnouncements('student-announcements');
            renderAnnouncements('admin-announcements');
            renderAnnouncements('staff-announcements');
        }

        function sendStaffAnnouncement() {
            const input = document.getElementById('staff-announcement-text');
            const audience = document.getElementById('staff-announcement-audience').value;
            const message = input.value.trim();
            if (!message) return;
            publishAnnouncement(message, audience);
            input.value = '';
        }

        function addAnnouncement() {
            const input = document.getElementById('new-ann-text');
            const announcement = input.value.trim();
            if (!announcement) return;
            announcementsList.unshift(announcement);
            input.value = '';
            renderAnnouncements('admin-announcements');
            renderAnnouncements('student-announcements');
            renderAnnouncements('staff-announcements');
        }
