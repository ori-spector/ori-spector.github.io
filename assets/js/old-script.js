function updateDateTime() {
    const dateTimePath = document.getElementById('date-time-path');
    if (!dateTimePath) return;

    const now = new Date();
    const timeZone = 'America/Los_Angeles';
    const month = now.toLocaleString('en-US', { timeZone, month: 'short' });
    const day = now.toLocaleString('en-US', { timeZone, day: 'numeric' });
    const time = now.toLocaleString('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();

    dateTimePath.textContent = `${month.toUpperCase()} ${day} - ${time.toUpperCase()}`;
}

updateDateTime();
setInterval(updateDateTime, 1000);

document.addEventListener('DOMContentLoaded', () => {
    const vinyl = document.getElementById('vinyl');
    const tonearm = document.getElementById('tonearm');
    const indicatorLight = document.querySelector('.indicator-light');
    const displayWindow = document.querySelector('.display-window');

    if (!vinyl) return;

    const recordAudio = new Audio('assets/media/audio.MP3');
    recordAudio.loop = true;
    recordAudio.volume = 0.7;

    let isPlaying = false;
    let currentRotation = 0;
    let animationId = null;

    function spinVinyl() {
        if (!isPlaying) return;
        currentRotation += 1;
        vinyl.style.transform = `rotate(${currentRotation}deg)`;
        animationId = requestAnimationFrame(spinVinyl);
    }

    function togglePlay() {
        isPlaying = !isPlaying;

        if (isPlaying) {
            if (tonearm) tonearm.classList.add('playing');
            if (indicatorLight) indicatorLight.classList.add('active');
            if (displayWindow) displayWindow.classList.add('active');

            setTimeout(() => {
                if (!isPlaying) return;
                animationId = requestAnimationFrame(spinVinyl);
                recordAudio.play().catch(err => {
                    console.log('Audio play prevented:', err);
                });
            }, 400);
        } else {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            recordAudio.pause();
            if (tonearm) tonearm.classList.remove('playing');
            if (indicatorLight) indicatorLight.classList.remove('active');
            if (displayWindow) displayWindow.classList.remove('active');
        }
    }

    vinyl.addEventListener('click', togglePlay);
});
