        document.addEventListener('click', function (event) {
            const target = event.target.closest('.ripple, .quick-action, .login-submit-btn, .logout-btn, .ann-input-group button, .status-option');
            if (!target) return;
            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
            target.style.overflow = 'hidden';
            target.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });

        const loaderEl = document.getElementById('scifi-loader');
        const loaderTitleEl = document.getElementById('loaderTitle');
        const loaderSubtitleEl = document.getElementById('loaderSubtitle');
        const loaderProgressFillEl = document.getElementById('loaderProgressFill');
        const loaderPercentageEl = document.getElementById('loaderPercentage');
        const loaderLogEl = document.getElementById('loaderLog');

        (function buildScannerTicks() {
            const container = document.getElementById('scannerTicks');
            if (!container) return;
            const count = 24;
            for (let i = 0; i < count; i++) {
                const tick = document.createElement('span');
                tick.style.transform = `rotate(${(360 / count) * i}deg) translateY(-100px)`;
                tick.style.transformOrigin = '0 0';
                tick.style.left = '50%';
                tick.style.top = '50%';
                tick.style.position = 'absolute';
                container.appendChild(tick);
            }
        })();

        (function buildParticles() {
            const container = document.getElementById('loaderParticles');
            if (!container) return;
            const isMobile = window.matchMedia('(max-width: 650px)').matches;
            const count = isMobile ? 6 : 12;
            for (let i = 0; i < count; i++) {
                const p = document.createElement('span');
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDuration = (7 + Math.random() * 6) + 's';
                p.style.animationDelay = Math.random() * 5 + 's';
                p.style.opacity = 0.4 + Math.random() * 0.5;
                if (Math.random() > 0.5) p.style.background = 'var(--neon-violet)';
                else if (Math.random() > 0.5) p.style.background = 'var(--neon-green)';
                container.appendChild(p);
            }
        })();

        const LOGIN_SEQUENCES = {
            student: {
                subtitle: 'STUDENT ACCESS VERIFIED', title: 'WELCOME, STUDENT', logs: [
                    'Establishing secure channel...', 'Verifying student credentials...', 'Decrypting academic profile...',
                    'Loading schedule matrix...', 'Syncing attendance records...', 'Access granted to STUDENT terminal'
                ]
            },
            teacher: {
                subtitle: 'FACULTY ACCESS VERIFIED', title: 'WELCOME, TEACHER', logs: [
                    'Establishing secure channel...', 'Authenticating instructor ID...', 'Loading class roster...',
                    'Syncing attendance console...', 'Preparing seat plan matrix...', 'Access granted to TEACHER terminal'
                ]
            },
            faculty: {
                subtitle: 'DEAN ACCESS VERIFIED', title: 'WELCOME, FACULTY', logs: [
                    'Establishing secure channel...', 'Authenticating dean credentials...', 'Loading department overview...',
                    'Scanning room availability...', 'Rendering command center...', 'Access granted to FACULTY terminal'
                ]
            },
            admin: {
                subtitle: 'ADMIN ACCESS VERIFIED', title: 'WELCOME, ADMIN', logs: [
                    'Establishing secure channel...', 'Authenticating administrator...', 'Loading enrollment ledger...',
                    'Compiling system notices...', 'Generating analytics dashboard...', 'Access granted to ADMIN terminal'
                ]
            }
        };

        const LOGOUT_SEQUENCES = {
            student: {
                subtitle: 'TERMINATING STUDENT SESSION', title: 'STUDENT LOGGING OUT', logs: [
                    'Saving attendance state...', 'Encrypting session tokens...', 'Closing academic profile...',
                    'Disconnecting from student terminal...', 'Session terminated successfully'
                ]
            },
            teacher: {
                subtitle: 'TERMINATING FACULTY SESSION', title: 'TEACHER LOGGING OUT', logs: [
                    'Saving class roster...', 'Encrypting session tokens...', 'Releasing seat plan locks...',
                    'Disconnecting from teacher terminal...', 'Session terminated successfully'
                ]
            },
            faculty: {
                subtitle: 'TERMINATING DEAN SESSION', title: 'FACULTY LOGGING OUT', logs: [
                    'Saving room layout...', 'Encrypting session tokens...', 'Releasing department locks...',
                    'Disconnecting from faculty terminal...', 'Session terminated successfully'
                ]
            },
            admin: {
                subtitle: 'TERMINATING ADMIN SESSION', title: 'ADMIN LOGGING OUT', logs: [
                    'Saving enrollment ledger...', 'Encrypting session tokens...', 'Closing system logs...',
                    'Disconnecting from admin terminal...', 'Session terminated successfully'
                ]
            }
        };

        function runLoader(sequence, onComplete, duration = 2400) {
            loaderLogEl.innerHTML = '';
            loaderProgressFillEl.style.width = '0%';
            loaderPercentageEl.textContent = '0%';
            loaderTitleEl.textContent = sequence.title;
            loaderSubtitleEl.textContent = sequence.subtitle;
            loaderEl.classList.remove('fade-out');
            loaderEl.classList.add('active');

            const startTime = performance.now();
            let logIndex = 0;
            const logInterval = duration / (sequence.logs.length + 1);

            const logTimer = setInterval(() => {
                if (logIndex < sequence.logs.length) {
                    const line = document.createElement('div');
                    line.className = 'log-line ' + (logIndex === sequence.logs.length - 1 ? 'ok' : 'warn');
                    line.textContent = sequence.logs[logIndex];
                    loaderLogEl.appendChild(line);
                    logIndex++;
                }
            }, logInterval);

            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(100, (elapsed / duration) * 100);
                loaderProgressFillEl.style.width = progress + '%';
                loaderPercentageEl.textContent = Math.floor(progress) + '%';
                if (progress < 100) {
                    requestAnimationFrame(animate);
                } else {
                    clearInterval(logTimer);
                    setTimeout(() => {
                        loaderEl.classList.add('fade-out');
                        setTimeout(() => {
                            loaderEl.classList.remove('active');
                            loaderEl.classList.remove('fade-out');
                            if (onComplete) onComplete();
                        }, 350);
                    }, 400);
                }
            }
            requestAnimationFrame(animate);
        }
