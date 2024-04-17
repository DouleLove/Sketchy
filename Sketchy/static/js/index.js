import {animateBrightness, animateOpacity} from './utils.js';


function setupAnimations() {
    const showcases = Array.from(document.getElementsByClassName('preview-showcase'));
    // forcing first element to has 100% brightness with 0s-lasting (instant) animation
    // to escape ugly setting up brightness like "showcases[0].style.filter = 'brightness(100%)';"
    animateBrightness(showcases[0], 0, 1, 0);
    showcases[0].classList.add('active');

    showcases.forEach(
        function(element) {
            animateOpacity(element, {0: 0, 0.5: 0, 1: 1});
            element.addEventListener('mouseenter', (event) => {
                if (!event.target.classList.contains('active')) {
                    animateBrightness(event.target, undefined, 0.8);
                }
            });
            element.addEventListener('mouseleave', (event) => {
                if (!event.target.classList.contains('active')) {
                    animateBrightness(event.target, undefined, 0.4);
                }
            });
            element.addEventListener('click', (event, forced=false) => {
                showcases.forEach((showcase) => {
                        if (showcase.classList.contains('active')) {
                            showcase.classList.remove('active');
                            showcase.dispatchEvent(
                                new Event(showcase.matches(':hover') ? 'mouseenter' : 'mouseleave',
                                          {view: window, bubbles: true, cancelable: false})
                            );
                        }
                    }
                );

                event.target.classList.add('active');
                animateBrightness(event.target, undefined, 1);

                if (!event.detail.forced) {  // prevent recursive calls on slide change
                    $('#previews-carousel').carousel(showcases.indexOf(event.target));
                }
            })
        }
    );

    animateOpacity(document.getElementById('previews-carousel'), {0: 0, 0.2: 0, 1: 1});
    $('#previews-carousel').on(
        'slide.bs.carousel',
        (e) => showcases[e.to].dispatchEvent(new CustomEvent('click',
                                             {bubbles: true, view: window, cancelable: false, detail: {forced: true}}))
    );

    Array.from(document.getElementsByClassName('step-icon')).concat(
        Array.from(document.getElementsByClassName('step-arrow')), document.getElementById('random-sketch-clickable'),
        document.getElementsByClassName('search-line-outer')[0], document.getElementById('preview-text')
    ).forEach((element) => animateOpacity(element, {0: 0, 0.5: 0, 1: 1}));
}

function setupSearch() {
    const searchRules = Array.from(document.getElementsByClassName('search-rule'));
    searchRules.forEach(
        (elem) => elem.addEventListener('mousedown', (clickEvent) => {
            clickEvent.preventDefault();  // cancel input to unfocus
            const currentSelected = document.getElementsByClassName('search-rule selected')[0];
            const newSelected = clickEvent.currentTarget;
            if (newSelected == currentSelected) { return; }
            if (currentSelected) {
                currentSelected.classList.remove('selected');
            }
            newSelected.classList.add('selected');
            const iconSVG = newSelected.children[0].children[0].cloneNode(true);
            iconSVG.classList.remove(...iconSVG.classList);
            iconSVG.classList.add('search-rule-selected-icon-ppv')
            const ppv = document.getElementsByClassName('search-rule-selected-icon-ppv-container')[0];
            ppv.replaceChildren();
            ppv.appendChild(iconSVG);
        })
    );
    searchRules[0].dispatchEvent(new Event('mousedown', {view: window, bubbles: true, cancelable: false}));
}


function main() {
    setupAnimations();
    setupSearch();
}

main();
