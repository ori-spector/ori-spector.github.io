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
    const recordAudio = new Audio('assets/media/audio.MP3');
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
    // Modal System with Shared Backdrop
    // ========================================
    const modalBackdrop = document.getElementById('modal-backdrop');
    const collectionTrigger = document.getElementById('collection-trigger');
    const collectionPanel = document.getElementById('collection-overlay');
    const sleeves = document.querySelectorAll('.record-sleeve');
    
    // Gallery elements
    const galleryPanel = document.getElementById('gallery-overlay');
    const galleryClose = galleryPanel ? galleryPanel.querySelector('.gallery-close') : null;
    const galleryGrid = document.getElementById('gallery-grid');
    
    // Document elements (declared early for closeAll)
    const docViewer = document.getElementById('doc-viewer');
    const docContent = document.getElementById('doc-content');
    const docClose = docViewer ? docViewer.querySelector('.doc-close') : null;
    const docFilename = docViewer ? docViewer.querySelector('.doc-filename') : null;
    
    // Gallery items
    const galleryItems = [
        { type: 'video', src: 'assets/media/idea-AAcRY7yh.mp4' },
        { type: 'video', src: 'assets/media/idea-CBzmxQGg.mp4' },
        { type: 'video', src: 'assets/media/idea-dg9kGVfw.mp4' },
        { type: 'video', src: 'assets/media/idea-iPr10t.mp4' },
        { type: 'video', src: 'assets/media/idea-JZJVvGtd.mp4' },
        { type: 'video', src: 'assets/media/idea-NVh_r19H.mp4' },
        { type: 'video', src: 'assets/media/idea-S4W_N5TJ.mp4' },
        { type: 'video', src: 'assets/media/idea-ObT87F19.mp4' },
        { type: 'video', src: 'assets/media/umbrella.mp4' },
        { type: 'video', src: 'assets/media/idea-WO1SGHsp.mp4' },
        { type: 'video', src: 'assets/media/idea-j59n34VS.mp4' },
        { type: 'video', src: 'assets/media/stairs2.mp4' },
        { type: 'video', src: 'assets/media/idea-0Q9mTo49.mp4' },
        { type: 'video', src: 'assets/media/idea-1dLZE-Qq.mp4' },
        { type: 'video', src: 'assets/media/idea-90SYxecU.mp4' },
        { type: 'video', src: 'assets/media/idea-Bd2KcI2I.mp4' },
        { type: 'video', src: 'assets/media/idea-o60Rud7i.mp4' },
        { type: 'video', src: 'assets/media/idea-RoZaVLwj.mp4' },
    ];
    
    // Track current panel
    let currentPanel = null;

    function showBackdrop() {
        if (!modalBackdrop) return;
        modalBackdrop.classList.add('open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
    }
    
    function hideBackdrop() {
        if (!modalBackdrop) return;
        modalBackdrop.classList.remove('open');
        modalBackdrop.setAttribute('aria-hidden', 'true');
    }
    
    function showPanel(panel) {
        if (!panel) return;
        // Hide current panel instantly (no transition)
        if (currentPanel && currentPanel !== panel) {
            currentPanel.classList.remove('open');
            currentPanel.setAttribute('aria-hidden', 'true');
        }
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        currentPanel = panel;
    }
    
    function hidePanel(panel) {
        if (!panel) return;
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        if (currentPanel === panel) currentPanel = null;
    }

    function openCollection() {
        showBackdrop();
        showPanel(collectionPanel);
    }
    
    function closeAll() {
        hidePanel(collectionPanel);
        hidePanel(galleryPanel);
        hidePanel(docViewer);
        hideBackdrop();
        currentPanel = null;
    }
    
    // Fisher-Yates shuffle
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    function populateGallery() {
        if (!galleryGrid || galleryGrid.children.length > 0) return;
        
        const shuffledItems = shuffleArray(galleryItems);
        shuffledItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            
            if (item.type === 'video') {
                const video = document.createElement('video');
                video.src = item.src;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                div.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = '';
                img.loading = 'lazy';
                div.appendChild(img);
            }
            
            galleryGrid.appendChild(div);
        });
    }
    
    function openGallery() {
        populateGallery();
        showPanel(galleryPanel);
    }
    
    function backToCollection() {
        showPanel(collectionPanel);
    }
    
    // Event listeners for collection
    if (collectionTrigger) {
        collectionTrigger.addEventListener('click', openCollection);
    }
    
    // Handle sleeve clicks
    sleeves.forEach(sleeve => {
        sleeve.addEventListener('click', () => {
            const content = sleeve.dataset.content;
            if (content === 'beliefs') {
                openDocumentPanel('beliefs');
            } else if (content === 'gallery') {
                openGallery();
            }
        });
    });
    
    // Click off collection panel to close
    if (collectionPanel) {
        collectionPanel.addEventListener('click', (e) => {
            // Only if clicking the panel itself, not the content inside
            if (e.target === collectionPanel) closeAll();
        });
    }
    
    // Click off gallery panel to go back
    if (galleryClose) {
        galleryClose.addEventListener('click', backToCollection);
    }
    
    if (galleryPanel) {
        galleryPanel.addEventListener('click', (e) => {
            if (e.target === galleryPanel) backToCollection();
        });
    }
    
    // Backdrop click closes all
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeAll);
    }
    
    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentPanel) {
            if (currentPanel === collectionPanel) {
                closeAll();
            } else {
                backToCollection();
            }
        }
    });
    
    // ========================================
    // Document Viewer
    // ========================================
    // Document contents
    const documents = {
        beliefs: {
            filename: '',
            content: `
                <ul>
                    <li><strong>Mediums matter.</strong> The visual domain is the most powerful alignment tool we have.</li>
                    <li><strong>New interfaces are necessary.</strong> Antiquated technologies are disrupted when new tools run freely.</li>
                    <li><strong>Nature, media, and art ground us.</strong> We need to use them intentionally.</li>
                </ul>
            `
        }
    };
    
    function openDocumentPanel(docName) {
        if (!docViewer || !docContent || !documents[docName]) return;
        
        const doc = documents[docName];
        docContent.innerHTML = doc.content;
        if (docFilename) docFilename.textContent = doc.filename;
        showPanel(docViewer);
    }
    
    if (docClose) {
        docClose.addEventListener('click', backToCollection);
    }
    
    if (docViewer) {
        docViewer.addEventListener('click', (e) => {
            if (e.target === docViewer) backToCollection();
        });
    }
});
