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
        stepsTitle.style.display = 'block';
        const sketchTourismInfo = document.getElementsByClassName('sketch-tourism-info-container')[0];
        sketchTourismInfo.style.left = x + 'px';
        const stepRight = document.getElementsByClassName('step-bg')[2];
        const xRight = stepRight.getBoundingClientRect().right;
        sketchTourismInfo.style.width = (xRight - x) + 'px';
        sketchTourismInfo.children[0].style.display = 'block';
        const sketchTourismTitle = document.getElementsByClassName('sketch-tourism-title')[0];
        const kite1 = document.getElementById('kite1');
        const kite1y = sketchTourismInfo.getBoundingClientRect().top - 30 + window.scrollY;
        const kite1x = sketchTourismTitle.getBoundingClientRect().left - 20;
        kite1.style.top = kite1y;
        kite1.style.left = kite1x;
        kite1.style.display = 'block';
    });
    window.dispatchEvent(new Event('resize'));
}

main();
