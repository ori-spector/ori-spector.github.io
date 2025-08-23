function updateDateTime() {
    const datetimeElement = document.getElementById('current-datetime');
    if (!datetimeElement) return;

    const now = new Date();
    const timeZone = 'America/Los_Angeles';

    const weekday = now.toLocaleString('en-US', { timeZone, weekday: 'short' });
    const month = now.toLocaleString('en-US', { timeZone, month: 'short' });
    const day = now.toLocaleString('en-US', { timeZone, day: 'numeric' });
    const daySuffix = getOrdinalSuffix(now.getDate());
    const time = now.toLocaleString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    const pretty = `${weekday}, ${month} ${day}${daySuffix} • ${time}`;
    datetimeElement.textContent = pretty;
}

function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th'; 
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

if (document.getElementById('current-datetime')) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('flipped');
        });
    });

    // Projects canvas interactions (guarded if elements are absent)
    const draggableContainer = document.querySelector('.draggable-container');
    const viewport = document.querySelector('.viewport');
    if (draggableContainer && viewport) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        let scale = 1;
        const MIN_SCALE = 0.2;
        const MAX_SCALE = 1.5;

        function dragStart(e) {
            if (e.target.closest('.project-item')) return;

            isDragging = true;

            const rect = viewport.getBoundingClientRect();

            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - rect.left - xOffset;
                initialY = e.touches[0].clientY - rect.top - yOffset;
            } else {
                initialX = e.clientX - rect.left - xOffset;
                initialY = e.clientY - rect.top - yOffset;
            }
        }

        function dragEnd() {
            isDragging = false;
        }

        function drag(e) {
            if (!isDragging) return;

            e.preventDefault();

            const rect = viewport.getBoundingClientRect();

            let clientX, clientY;

            if (e.type === "touchmove") {
                clientX = e.touches[0].clientX - rect.left;
                clientY = e.touches[0].clientY - rect.top;
            } else {
                clientX = e.clientX - rect.left;
                clientY = e.clientY - rect.top;
            }

            currentX = clientX - initialX;
            currentY = clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            updateTransform();
        }

        function handleWheel(e) {
            e.preventDefault();
            const delta = e.deltaY * -0.005;
            const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);

            if (newScale !== scale) {
                const rect = viewport.getBoundingClientRect();

                const mouseX = (e.clientX - rect.left - xOffset) / scale;
                const mouseY = (e.clientY - rect.top - yOffset) / scale;

                xOffset -= (mouseX * (newScale - scale));
                yOffset -= (mouseY * (newScale - scale));

                scale = newScale;
                updateTransform();
            }
        }

        function updateTransform() {
            draggableContainer.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${scale})`;
        }

        function adjustInitialScale() {
            if (window.innerWidth <= 480) {
                scale = 0.5;
            } else if (window.innerWidth <= 768) {
                scale = 0.75;
            } else {
                scale = 1;
            }
            updateTransform();
        }

        adjustInitialScale();

        window.addEventListener('resize', adjustInitialScale);

        viewport.addEventListener("touchstart", dragStart, false);
        viewport.addEventListener("touchend", dragEnd, false);
        viewport.addEventListener("touchmove", drag, false);

        viewport.addEventListener("mousedown", dragStart, false);
        viewport.addEventListener("mouseup", dragEnd, false);
        viewport.addEventListener("mousemove", drag, false);
        viewport.addEventListener("mouseleave", dragEnd, false);

        viewport.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Bullet rotator on menu page (type-and-erase)
    const rotatorRoot = document.getElementById('bullet-rotator');
    if (rotatorRoot) {
        const bullets = [
            'm.s. computer science and b.s. symbolic systems from stanford',
            'product engineer at luma ai',
            'building tools for multimodal creative intelligence',
            'dabbling in screenplays, film, and philosophy'
        ];
        let index = 0;
        let text = '';
        let pos = 0;
        let erasing = false;
        const cursor = '<span class="cursor">\u00A0</span>';

        function render() {
            rotatorRoot.innerHTML = text + cursor;
        }

        function tick() {
            const current = bullets[index];
            if (!erasing) {
                // typing forward
                text = current.slice(0, pos + 1);
                pos += 1;
                render();
                if (pos < current.length) {
                    setTimeout(tick, 28 + Math.random() * 36);
                } else {
                    // hold before erasing
                    setTimeout(() => { erasing = true; tick(); }, 2000);
                }
            } else {
                // erasing backward
                text = current.slice(0, Math.max(0, pos - 1));
                pos -= 1;
                render();
                if (pos > 0) {
                    setTimeout(tick, 20 + Math.random() * 28);
                } else {
                    // move to next bullet
                    erasing = false;
                    index = (index + 1) % bullets.length;
                    setTimeout(tick, 500);
                }
            }
        }

        // start
        setTimeout(tick, 400);
    }

    // Secret terminal overlay on menu page
    const terminalTrigger = document.getElementById('terminal-trigger');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalClose = terminalOverlay ? terminalOverlay.querySelector('.terminal-close') : null;
    const xtermMount = document.getElementById('xterm');
    let xtermInstance = null;
    let currentLine = '';

    if (terminalTrigger && terminalOverlay && terminalClose && xtermMount) {
        function openTerminal() {
            terminalOverlay.classList.add('open');
            terminalOverlay.setAttribute('aria-hidden', 'false');
            
            // Create xterm instance if not exists
            if (window.Terminal && !xtermInstance) {
                xtermInstance = new window.Terminal({
                    cursorBlink: true,
                    fontFamily: 'Courier Prime, Courier New, monospace',
                    fontSize: 14,
                    theme: {
                        background: '#0a0e14',
                        foreground: '#d4d4d4',
                        cursor: '#d4d4d4',
                        black: '#0a0e14',
                        brightBlack: '#686868',
                        red: '#ff5f56',
                        green: '#27c93f',
                        yellow: '#ffbd2e',
                        blue: '#5abbed',
                        magenta: '#ff6ac1',
                        cyan: '#5abbed',
                        white: '#d4d4d4'
                    }
                });
                xtermInstance.open(xtermMount);
                
                // Handle input
                xtermInstance.onData((data) => {
                    if (data === '\r') { // Enter key
                        if (currentLine.trim() === 'cat ~/.ssh/beliefs') {
                            xtermInstance.write('\r\n');
                            const beliefs = [
                                'Mediums matter. The visual domain is the most powerful alignment tool.',
                                'Intellectual depth is created from pushing back against majority assumptions.',
                                'Nature, media, and art ground us. We need to use them.'
                            ];
                            beliefs.forEach(belief => {
                                xtermInstance.writeln(belief);
                            });
                            xtermInstance.write('\r\nori@studio ~ % ');
                        } else {
                            xtermInstance.write('\r\nori@studio ~ % ');
                        }
                        currentLine = '';
                    } else if (data === '\u007F') { // Backspace
                        if (currentLine.length > 0) {
                            currentLine = currentLine.slice(0, -1);
                            xtermInstance.write('\b \b');
                        }
                    } else if (data >= ' ') { // Printable characters
                        currentLine += data;
                        xtermInstance.write(data);
                    }
                });
            }
            
            if (xtermInstance) {
                xtermInstance.clear();
                xtermInstance.write('ori@studio ~ % cat ~/.ssh/beliefs');
                currentLine = 'cat ~/.ssh/beliefs';
                xtermInstance.focus();
            }
        }

        function closeTerminal() {
            terminalOverlay.classList.remove('open');
            terminalOverlay.setAttribute('aria-hidden', 'true');
        }

        terminalTrigger.addEventListener('click', openTerminal);
        terminalClose.addEventListener('click', closeTerminal);
        terminalOverlay.addEventListener('click', (e) => {
            if (e.target === terminalOverlay) closeTerminal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && terminalOverlay.classList.contains('open')) {
                closeTerminal();
            }
        });
    }
});

function getPacificAbbreviation(date) {
    try {
        const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'short' });
        const parts = fmt.formatToParts(date);
        const name = parts.find(p => p.type === 'timeZoneName')?.value || '';
        if (/^PDT$|^PST$/.test(name)) return name;
        return 'PT';
    } catch (_) {
        return 'PT';
    }
}
