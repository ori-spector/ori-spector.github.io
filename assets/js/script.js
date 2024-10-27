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
    let pstDateTime = now.toLocaleString('en-US', options);
    pstDateTime = pstDateTime.replace("at", "@");
    datetimeElement.textContent = pstDateTime;
}

// Only set up the timer if the element exists
if (document.getElementById('current-datetime')) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const projectItems = document.querySelectorAll('.project-item');
    console.log('Found project items:', projectItems.length);
    
    projectItems.forEach(item => {
        item.addEventListener('click', function(e) {
            console.log('Item clicked');
            this.classList.toggle('flipped');
        });
    });
});
