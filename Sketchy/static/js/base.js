function markActiveNavButton() {
    const currentUrl = window.location.href.split('?')[0];
    const navButtons = document.getElementsByClassName('nav-btn');

    for (const btn of navButtons) {
        if (btn.href == currentUrl) {
            return btn.classList.add('active');
        }
    }
}

markActiveNavButton();
window.history.replaceState({}, '', encodeURI(window.location.href));
