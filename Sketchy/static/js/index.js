import {animateBrightness, animateOpacity, getURLParameters, encodeURL, formatURL} from './utils.js';
import {SearchLoader} from './loaders.js';
import {loadPopUp} from './base.js'
import {setupSketchPopUp} from './sketch.js';

var loader;


function loadSketchPopUp(sid) {
    sid = sid ? sid : getURLParameters().sid;

    const params = {}
    if (sid) {
        params.sid = sid;
    }

    loadPopUp(window.location.origin + '/sketch', params, setupSketchPopUp);
}


function reqLoad(additional=false) {
    const rule = $('.search-rule.selected').attr('data-rule');
    const query = $('.search-input').val();

    if (!loader || loader.rule != rule || additional == false) {
        loader = new SearchLoader();
        loader.limit = 30;
        loader.rule = rule;
        loader.query = query;
    }

    try {
        let cd = '';
        loader.request().then((data) => {
            if (additional == false) {
                $('#container-sketches-inner-ctn').empty();
            }
            let d = $('<div>' + data.rendered + '</div>').find('.sketch-item');
            let l_ = d.length;
            d.each((i, elem) => {
                cd += $(elem).get(0).outerHTML;
                let e = '<div class="sketches-row">' + cd + '</div>';
                if ($(e).find('.sketch-item').length == 2) {
                    cd = '';
                    $('#container-sketches-inner-ctn').append(e);
                }
                if (i == l_ - 1 && $(e).find('.sketch-item').length == 1) {
                    $('#container-sketches-inner-ctn').append(e);
                }
                const r = $('#container-sketches-inner-ctn').children().last();
                if (r) {
                    $(r).children().each((i, elem) => elem.addEventListener('click',
                        (e) => loadSketchPopUp(e.currentTarget.getAttribute('data-sid')))
                    );
                }
            });
            if (!loader.active) {
                $('#btn-load-more').hide();
            } else {
                $('#btn-load-more').show();
            }
        });
    } catch (e) {
        if (e instanceof TypeError) {
            return;
        }
    }
}


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
    document.getElementById('form-search').addEventListener('submit', (e) => {
        e.preventDefault();
        reqLoad();
    });
    document.getElementById('btn-load-more').addEventListener('click', () => {
        reqLoad(true);
    });
    reqLoad();

    const sid = +(getURLParameters().sid || 0)
    if (sid) {
        loadSketchPopUp(sid);
    }
    $('#random-sketch-wrapper').on('click', () => loadSketchPopUp());

    const urlParams = getURLParameters();
    if (urlParams.hook) {
        const searchRule = urlParams.hook;
        const val = urlParams[searchRule];
        delete urlParams['hook'];
        delete urlParams[searchRule];
        window.history.replaceState({}, '', encodeURL(formatURL(window.location.href.split('?')[0], urlParams)));
        $(`.search-rule[data-rule="${searchRule}"]`).get(0).dispatchEvent(new Event('mousedown'));
        $('input[name="search-input"]').val(val);
        document.getElementById('form-search').dispatchEvent(new Event('submit'));
        const y = document.getElementById('section-sketches').getBoundingClientRect().top - 65;
        setTimeout(() => window.scroll({top: y, behavior: 'smooth'}), 100)  // wait for submit to be handled
    }
}

main();
