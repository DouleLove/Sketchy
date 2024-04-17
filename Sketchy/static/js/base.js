import {encodeURL} from './utils.js'


export function addRendered(elem) {
    $(elem).hide().appendTo($('#section-messages')).fadeIn('slow',
        () => setTimeout(() => $(elem).fadeOut('slow', () => $(elem).remove()), 2000)
    );
}


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
