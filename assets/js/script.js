// ========================================
// Date/Time Display
// ========================================
function updateDateTime() {
    const dateTimePath = document.getElementById('date-time-path');

    const now = new Date();
    const timeZone = 'America/Los_Angeles';

    const weekday = now.toLocaleString('en-US', { timeZone, weekday: 'short' });
    const month = now.toLocaleString('en-US', { timeZone, month: 'short' });
    const day = now.toLocaleString('en-US', { timeZone, day: 'numeric' });
    const daySuffix = getOrdinalSuffix(now.getDate());
    const time = now.toLocaleString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    
    // Update circular text on vinyl label
    if (dateTimePath) {
        dateTimePath.textContent = `${month.toUpperCase()} ${day} • ${time.toUpperCase()}`;
    }
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

// Initialize datetime
updateDateTime();
setInterval(updateDateTime, 1000);

// ========================================
// Record Player Functionality
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Record Player Elements
    const vinyl = document.getElementById('vinyl');
    const tonearm = document.getElementById('tonearm');
    const indicatorLight = document.querySelector('.indicator-light');
    const displayWindow = document.querySelector('.display-window');
    
    // Audio for the record player
    const recordAudio = new Audio('assets/media/sound-song.MP3');
    recordAudio.loop = true;
    recordAudio.volume = 0.7;
    
    let isPlaying = false;
    let currentRotation = 0;
    let animationId = null;
    
    if (vinyl) {
        // Custom spin animation to track rotation
        function spinVinyl() {
            if (!isPlaying) return;
            
            // ~33 RPM = 6 degrees per frame at 60fps ≈ 360deg in ~1 sec
            // Slower: 1 degree per frame = ~6 seconds per rotation (realistic)
            currentRotation += 1;
            
            vinyl.style.transform = `rotate(${currentRotation}deg)`;
            animationId = requestAnimationFrame(spinVinyl);
        }
        
        // Play/Pause toggle - click the vinyl to start/stop
        function togglePlay() {
            isPlaying = !isPlaying;
            
            if (isPlaying) {
                // Start playing
                if (tonearm) tonearm.classList.add('playing');
                if (indicatorLight) indicatorLight.classList.add('active');
                if (displayWindow) displayWindow.classList.add('active');
                
                // Start spinning and audio after tonearm moves (small delay)
                setTimeout(() => {
                    if (isPlaying) {
                        animationId = requestAnimationFrame(spinVinyl);
                        recordAudio.play().catch(err => {
                            console.log('Audio play prevented:', err);
                        });
                    }
                }, 400);
            } else {
                // Stop playing - vinyl stays at current position, audio pauses (doesn't reset)
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                recordAudio.pause(); // Pauses without resetting position
                if (tonearm) tonearm.classList.remove('playing');
                if (indicatorLight) indicatorLight.classList.remove('active');
                if (displayWindow) displayWindow.classList.remove('active');
            }
        }
        
        // Click vinyl to toggle play
        vinyl.addEventListener('click', togglePlay);
    }
    
    // ========================================
    // Terminal Functionality
    // ========================================
    const terminalTrigger = document.getElementById('terminal-trigger');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalClose = terminalOverlay ? terminalOverlay.querySelector('.terminal-close') : null;
    const xtermMount = document.getElementById('xterm');
    let xtermInstance = null;
    let currentLine = '';
    let cursorPosition = 0;
    
    // Command history
    let commandHistory = [];
    let historyIndex = -1;
    let tempCurrentLine = '';
    
    // Available commands for autocomplete
    const availableCommands = [
        'open beliefs.txt',
        'show inspirations',
        'clear',
        '/help'
    ];

    if (terminalTrigger && terminalOverlay && terminalClose && xtermMount) {
        function openTerminal() {
            terminalOverlay.classList.add('open');
            terminalOverlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('terminal-open');
            
            // Create xterm instance if not exists
            if (window.Terminal && !xtermInstance) {
                xtermInstance = new window.Terminal({
                    cursorBlink: true,
                    fontFamily: 'JetBrains Mono, SF Mono, Consolas, monospace',
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
                    const code = data.charCodeAt(0);
                    
                    if (data === '\r') { // Enter key
                        const command = currentLine.trim();
                        xtermInstance.write('\r\n');
                        
                        // Add to history if not empty and different from last
                        if (command && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command)) {
                            commandHistory.push(command);
                        }
                        historyIndex = commandHistory.length;
                        tempCurrentLine = '';
                        
                        if (command === '/help') {
                            xtermInstance.writeln('Available commands:');
                            xtermInstance.writeln('  open beliefs.txt      - Display my core beliefs');
                            xtermInstance.writeln('  show inspirations     - Open media inspirations');
                            xtermInstance.writeln('  clear                 - Clear terminal');
                        } else if (command === 'open beliefs' || command === 'open beliefs.txt') {
                            xtermInstance.writeln('Opening beliefs.txt...');
                            setTimeout(() => {
                                openDocument('beliefs');
                            }, 300);
                        } else if (command === 'show inspirations') {
                            xtermInstance.writeln('Opening gallery...');
                            setTimeout(() => {
                                window.location.href = 'gallery.html';
                            }, 1000);
                        } else if (command === 'clear') {
                            xtermInstance.clear();
                            xtermInstance.write('ori@studio ~ % ');
                        } else if (command !== '') {
                            xtermInstance.writeln(`Command not found: ${command}`);
                            xtermInstance.writeln('Type /help for available commands');
                        }
                        
                        if (command !== 'clear' && command !== 'show inspirations') {
                            xtermInstance.write('\r\nori@studio ~ % ');
                        }
                        currentLine = '';
                        cursorPosition = 0;
                    } else if (data === '\t') { // Tab - autocomplete
                        const matches = availableCommands.filter(cmd => cmd.startsWith(currentLine));
                        if (matches.length === 1) {
                            // Single match - complete it
                            const completion = matches[0].slice(currentLine.length);
                            currentLine += completion;
                            cursorPosition = currentLine.length;
                            xtermInstance.write(completion);
                        } else if (matches.length > 1) {
                            // Multiple matches - show them
                            xtermInstance.write('\r\n');
                            matches.forEach(m => xtermInstance.writeln('  ' + m));
                            xtermInstance.write('ori@studio ~ % ' + currentLine);
                        }
                    } else if (data === '\u007F') { // Backspace
                        if (cursorPosition > 0) {
                            currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
                            cursorPosition--;
                            xtermInstance.write('\b \b');
                            if (cursorPosition < currentLine.length) {
                                const remainingText = currentLine.slice(cursorPosition);
                                xtermInstance.write(remainingText + ' ');
                                xtermInstance.write('\x1b[' + (remainingText.length + 1) + 'D');
                            }
                        }
                    } else if (data === '\x1b[D') { // Left arrow
                        if (cursorPosition > 0) {
                            cursorPosition--;
                            xtermInstance.write('\x1b[D');
                        }
                    } else if (data === '\x1b[C') { // Right arrow
                        if (cursorPosition < currentLine.length) {
                            cursorPosition++;
                            xtermInstance.write('\x1b[C');
                        }
                    } else if (data === '\x1b[A') { // Up arrow - history back
                        if (commandHistory.length > 0 && historyIndex > 0) {
                            // Save current line if at the end
                            if (historyIndex === commandHistory.length) {
                                tempCurrentLine = currentLine;
                            }
                            historyIndex--;
                            // Clear current line
                            xtermInstance.write('\r\x1b[K');
                            xtermInstance.write('ori@studio ~ % ');
                            // Write history command
                            currentLine = commandHistory[historyIndex];
                            cursorPosition = currentLine.length;
                            xtermInstance.write(currentLine);
                        }
                    } else if (data === '\x1b[B') { // Down arrow - history forward
                        if (historyIndex < commandHistory.length) {
                            historyIndex++;
                            // Clear current line
                            xtermInstance.write('\r\x1b[K');
                            xtermInstance.write('ori@studio ~ % ');
                            // Write next history or temp line
                            if (historyIndex === commandHistory.length) {
                                currentLine = tempCurrentLine;
                            } else {
                                currentLine = commandHistory[historyIndex];
                            }
                            cursorPosition = currentLine.length;
                            xtermInstance.write(currentLine);
                        }
                    } else if (code >= 32 && code <= 126) { // Printable characters
                        currentLine = currentLine.slice(0, cursorPosition) + data + currentLine.slice(cursorPosition);
                        
                        if (cursorPosition === currentLine.length - 1) {
                            xtermInstance.write(data);
                        } else {
                            const remainingText = currentLine.slice(cursorPosition + 1);
                            xtermInstance.write(data + remainingText);
                            if (remainingText.length > 0) {
                                xtermInstance.write('\x1b[' + remainingText.length + 'D');
                            }
                        }
                        cursorPosition++;
                    }
                });
            }
            
            if (xtermInstance) {
                xtermInstance.clear();
                // xtermInstance.writeln('Terminal');
                // xtermInstance.writeln('Type /help to see available commands');
                xtermInstance.write('\rori@studio ~ % ');
                currentLine = '';
                cursorPosition = 0;
                xtermInstance.focus();
            }
        }

        function closeTerminal() {
            terminalOverlay.classList.remove('open');
            terminalOverlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('terminal-open');
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
    
    // ========================================
    // Document Viewer
    // ========================================
    const docViewer = document.getElementById('doc-viewer');
    const docContent = document.getElementById('doc-content');
    const docClose = docViewer ? docViewer.querySelector('.doc-close') : null;
    const docFilename = docViewer ? docViewer.querySelector('.doc-filename') : null;
    
    // Document contents
    const documents = {
        beliefs: {
            filename: 'beliefs.txt',
            content: `
                <ul>
                    <li><strong>Mediums matter.</strong> The visual domain is the most powerful alignment tool we have.</li>
                    <li><strong>New interfaces are necessary</strong> to displace antiquated technology and unlock human potential.</li>
                    <li><strong>Nature, media, and art ground us.</strong> We need to use them intentionally.</li>
                </ul>
            `
        }
    };
    
    window.openDocument = function(docName) {
        if (!docViewer || !docContent || !documents[docName]) return;
        
        const doc = documents[docName];
        docContent.innerHTML = doc.content;
        if (docFilename) docFilename.textContent = doc.filename;
        docViewer.classList.add('open');
        docViewer.setAttribute('aria-hidden', 'false');
    };
    
    function closeDocument() {
        if (!docViewer) return;
        docViewer.classList.remove('open');
        docViewer.setAttribute('aria-hidden', 'true');
    }
    
    if (docClose) {
        docClose.addEventListener('click', closeDocument);
    }
    
    if (docViewer) {
        docViewer.addEventListener('click', (e) => {
            if (e.target === docViewer) closeDocument();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && docViewer.classList.contains('open')) {
                closeDocument();
            }
        });
    }
});
