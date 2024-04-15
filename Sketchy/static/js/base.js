import {encodeURL} from './utils.js'


function markActiveNavButton() {
    const currentUrl = window.location.href.split('?')[0];
    const navButtons = document.getElementsByClassName('nav-btn');

    for (const btn of navButtons) {
        if (btn.href == currentUrl) {
            return btn.classList.add('active');
        }
    }
}


function main() {
    markActiveNavButton();
    window.history.replaceState({}, '', encodeURL());
}


main();
