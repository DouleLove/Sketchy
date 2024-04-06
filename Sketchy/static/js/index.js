import {getBrightness, animateBrightness, animateOpacity} from './utils.js'

function setupAnimations() {
    const showcases = Array.from(document.getElementsByClassName('preview-showcase'));

    showcases.forEach(
        function(element) {
            animateOpacity(element, {0: 0, 0.5: 0, 1: 1})
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

    showcases[0].style.filter = 'brightness(100%)';
    showcases[0].classList.add('active');

    $('#previews-carousel').on(
        'slide.bs.carousel',
        (e) => showcases[e.to].dispatchEvent(new CustomEvent('click',
                                             {bubbles: true, view: window, cancelable: false, detail: {forced: true}}))
    );

    Array.from(document.getElementsByClassName('step-icon')).concat(
        Array.from(document.getElementsByClassName('step-arrow')), document.getElementById('random-sketch-clickable'),
        document.getElementsByClassName('search-line-outer')[0]
    ).forEach((element) => animateOpacity(element, {0: 0, 0.5: 0, 1: 1}));
}

setupAnimations();
