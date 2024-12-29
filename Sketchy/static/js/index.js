import {animateBrightness, animateOpacity, loadSketchPopUp} from './utils.js';


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

    animateOpacity(document.getElementById('preview-text'), {0: 0, 0.5: 0, 1: 1})
}


function main() {
    setupAnimations();
    $('#random-sketch-wrapper').on('click', () => loadSketchPopUp());
    addEventListener('resize', (e) => {
        const step = document.getElementsByClassName('step-bg')[0];
        const x = step.getBoundingClientRect().left;
        const stepsTitle = document.getElementsByClassName('steps-ttl')[0];
        stepsTitle.style.marginLeft = x + 'px';
    })
    window.dispatchEvent(new Event('resize'));
}

main();
