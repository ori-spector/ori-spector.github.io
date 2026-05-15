const viewButtons = document.querySelectorAll('[data-view-button]');
const homeViews = document.querySelectorAll('[data-home-view]');
const homeShell = document.querySelector('.home-shell');

function setHomeView(viewName) {
    if (homeShell) {
        homeShell.dataset.currentView = viewName;
    }

    viewButtons.forEach(button => {
        const isActive = button.dataset.viewButton === viewName;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    homeViews.forEach(view => {
        const isActive = view.dataset.homeView === viewName;
        view.hidden = !isActive;
        view.classList.toggle('is-active', isActive);
    });
}

viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        setHomeView(button.dataset.viewButton);
    });
});
