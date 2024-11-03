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
});
