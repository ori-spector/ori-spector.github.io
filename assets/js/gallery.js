document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-home');
    const mediaItems = document.querySelectorAll('.media-item');
    const videoModal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.querySelector('.modal-close');

    // Back to home functionality
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Media item interactions
    mediaItems.forEach(item => {
        const video = item.querySelector('video');
        
        // Play preview on hover
        item.addEventListener('mouseenter', () => {
            if (video) {
                video.play().catch(() => {
                    // Ignore autoplay errors
                });
            }
        });
        
        // Pause preview on leave
        item.addEventListener('mouseleave', () => {
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Open modal on click
        item.addEventListener('click', () => {
            const src = item.dataset.src;
            const title = item.dataset.title;
            
            if (src && title) {
                openVideoModal(src, title);
            }
        });
    });

    // Modal functionality
    function openVideoModal(src, title) {
        modalVideo.src = src;
        modalTitle.textContent = title;
        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        
        // Play video
        modalVideo.play().catch(() => {
            // Ignore autoplay errors
        });
    }

    function closeVideoModal() {
        videoModal.classList.remove('open');
        videoModal.setAttribute('aria-hidden', 'true');
        modalVideo.pause();
        modalVideo.src = '';
    }

    // Close modal events
    modalClose.addEventListener('click', closeVideoModal);
    
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('open')) {
            closeVideoModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'h' && !videoModal.classList.contains('open')) {
            window.location.href = 'index.html';
        }
    });
});
