function updateDateTime() {
    const datetimeElement = document.getElementById('current-datetime');
    if (!datetimeElement) return; 
    
    const now = new Date();
    const options = {
        timeZone: 'America/Los_Angeles',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    let daySuffix = getOrdinalSuffix(now.getDate());
    let pstDateTime = now.toLocaleString('en-US', options);
    pstDateTime = pstDateTime.replace(/(\d+)/, `$1${daySuffix}`);
    pstDateTime = pstDateTime.replace("at", "@");

    datetimeElement.textContent = pstDateTime;
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

    const draggableContainer = document.querySelector('.draggable-container');
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

    const viewport = document.querySelector('.viewport');
    
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
});
