function updateDateTime() {
    const now = new Date();
    const options = {
        timeZone: 'America/Los_Angeles',
        // year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    let pstDateTime = now.toLocaleString('en-US', options);
    console.log(pstDateTime);
    pstDateTime = pstDateTime.replace("at", "@");
    document.getElementById('current-datetime').textContent = pstDateTime;
}

// Update the date and time every second
updateDateTime();
setInterval(updateDateTime, 1000);