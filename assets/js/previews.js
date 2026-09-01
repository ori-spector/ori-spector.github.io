document.querySelectorAll('video.hover-preview').forEach(video => {
    video.muted = true;
    video.tabIndex = 0;

    const load = () => {
        if (video.getAttribute('src') || !video.dataset.src) return;
        video.src = video.dataset.src;
        video.load();
    };

    const play = () => {
        load();
        video.play().catch(() => {});
    };

    const pause = () => {
        video.pause();
        try {
            video.currentTime = 0;
        } catch {
            // Ignore browsers that cannot seek before metadata is ready.
        }
        video.classList.remove('is-playing');
    };

    video.addEventListener('mouseenter', () => {
        video.classList.add('is-playing');
        play();
    });

    video.addEventListener('mouseleave', pause);

    video.addEventListener('focus', () => {
        video.classList.add('is-playing');
        play();
    });

    video.addEventListener('blur', pause);

    video.addEventListener('touchstart', () => {
        video.classList.add('is-playing');
        play();
    }, { passive: true });
});
