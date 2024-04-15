import {getBrightness, animateBrightness, animateOpacity} from './utils.js'

function setupAnimations() {
    animateOpacity(document.getElementById('background-container'), {0: 0, 0.2: 0, 1: 1});

    Array.from(document.getElementsByClassName('bg-icon')).concat(
        document.getElementById('auth-form')
    ).forEach((element) => animateOpacity(element, {0: 0, 0.5: 0, 1: 1}));
}


function main() {
    setupAnimations();
}

main();
