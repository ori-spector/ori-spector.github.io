function updateDateTime() {
    const datetimeElement = document.getElementById('current-datetime');
    if (!datetimeElement) return; // Skip if element doesn't exist
    
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
    if (day > 3 && day < 21) return 'th'; // covers 11th to 19th
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Only set up the timer if the element exists
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
    const MIN_SCALE = 0.2;  // Minimum zoom out (20%)
    const MAX_SCALE = 1;    // Maximum zoom in (current size)

    // Update event listeners to target the viewport instead of main
    const viewport = document.querySelector('.viewport');
    
    function dragStart(e) {
        // Prevent dragging when clicking on a project item
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

    // Add zoom handler
    function handleWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY * -0.005;
        const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);

        if (newScale !== scale) {
            // Get the bounding rectangle of the viewport
            const rect = viewport.getBoundingClientRect();
            // Calculate mouse position relative to the draggable container
            const mouseX = e.clientX - rect.left - xOffset;
            const mouseY = e.clientY - rect.top - yOffset;

            // Calculate scaling factor
            const scaleChange = newScale / scale;

            // Update offsets to keep the zoom centered on the mouse position
            xOffset = xOffset - (mouseX * (scaleChange - 1));
            yOffset = yOffset - (mouseY * (scaleChange - 1));

            // Update the scale
            scale = newScale;

            updateTransform();
        }
    }

    function updateTransform() {
        draggableContainer.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${scale})`;
    }

    // Event listeners
    viewport.addEventListener("touchstart", dragStart, false);
    viewport.addEventListener("touchend", dragEnd, false);
    viewport.addEventListener("touchmove", drag, false);

    viewport.addEventListener("mousedown", dragStart, false);
    viewport.addEventListener("mouseup", dragEnd, false);
    viewport.addEventListener("mousemove", drag, false);
    viewport.addEventListener("mouseleave", dragEnd, false);

    // Add wheel event listener for zooming
    viewport.addEventListener('wheel', handleWheel, { passive: false });
});
