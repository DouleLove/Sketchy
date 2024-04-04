function markActiveNavButton() {
    const currentUrl = window.location.href;
    const navButtons = document.getElementsByClassName('nav-btn');

    for (const btn of navButtons) {
        if (btn.href == currentUrl) {
            return btn.classList.add('active');
        }
    }
}

markActiveNavButton()
