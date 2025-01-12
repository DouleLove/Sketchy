import {getURLParameters, encodeURL, formatURL, loadSketchPopUp, animateOpacity, animateBrightness} from './utils.js';
import {setupSketchPopUp} from './sketch.js';


export function addRendered(elem) {
    $(elem).hide().appendTo($('#section-messages')).fadeIn('slow',
        () => setTimeout(() => $(elem).fadeOut('slow', () => $(elem).remove()), 2000)
    );
}


export function loadPopUp(url, params, onsuccess=null) {
    const p = getURLParameters(url);
    for (let param in params) {
        p[param] = params[param];
    }

    url = encodeURL(formatURL(url.split('?')[0], p))
    $.get(url, (data) => {
        $('.wrapper-pop-up').html(data.rendered);
        $('.wrapper-pop-up').children().eq(0).on('click', (e) => {
            if (!$(e.currentTarget).find(e.target).length) {
                $('#btn-pop-up-close').trigger('click');
            }
        });
        const urlParams = getURLParameters();
        urlParams.sid = data.data.sid;
        window.history.pushState({}, '', encodeURL(formatURL(window.location.href.split('?')[0], urlParams)));

        if (onsuccess != null) {
            onsuccess();
        }
    });
}


function markActiveNavButton() {
    const currentUrl = window.location.href.split('?')[0].split('//').slice(1).join('//');
    const navButtons = [...document.getElementsByClassName('nav-btn')];
    const navButtonsShort = [...document.getElementsByClassName('nav-btn-short')]
    const btns = navButtons.concat(navButtonsShort)

    for (const btn of btns) {
        const btnHref = btn.href.split('//').slice(1).join('//');
        if (btnHref == currentUrl) {
            const uid = $('meta[name="uid"]').attr('content');
            const cuuid = $('meta[name="cu-uid"]').attr('content');
            const urlParams = getURLParameters();
            if (uid && cuuid && uid !== cuuid) {
                return;
            }
            btn.classList.add('active');
            if (btn.href.split('/').pop() == 'sketches' && urlParams.query) {
                return;
            }
            btn.onclick = (e) => {e.preventDefault()};
        }
    }
}


function main() {
    markActiveNavButton();
    window.addEventListener('resize', () => {
        if (window.innerWidth < 1000) {
            $('.nav-buttons').hide();
            $('#img-logo-nav-wrapper').hide();
            $('.img-logo_dropdown-container-short').show();
            $('.img-logo-container-short').show();
            const spans = $('.nav-btn-short > span')
            $(spans).each((idx) => {
                $($(spans)[idx]).show();
            });
        } else {
            $('.nav-buttons').show();
            $('#img-logo-nav-wrapper').show();
            $('.img-logo_dropdown-container-short').hide();
            $('.img-logo-container-short').hide();
            const spans = $('.nav-btn-short > span')
            $(spans).each((idx) => {
                $($(spans)[idx]).hide();
            });
        }
        document.getElementsByClassName('img-logo-switch-container')[0].style.opacity = "1";
        document.getElementsByClassName('search-container')[0].style.opacity = "1";
        document.getElementsByClassName('nav-buttons-switch-container')[0].style.opacity = "1";
        const navPanelShort = document.getElementById('section-nav-buttons-dropdown-options-container-short');
        const logoShort = document.getElementById('img-logo-nav-short')
        const boundingRectLogo = logoShort.getBoundingClientRect();
        const panelWidth = boundingRectLogo.left + Math.floor((boundingRectLogo.right - boundingRectLogo.left) / 2);
        navPanelShort.style.width = panelWidth + 'px';
    });
    window.dispatchEvent(new Event('resize'));
    window.history.replaceState({}, '', encodeURL());
    addEventListener('popstate', (e) => {
        if (getURLParameters().sid) {
            loadSketchPopUp(getURLParameters().sid)
        } else {
            $('.wrapper-pop-up').html('');
        }
    })
    $('#btn-pop-up-close').on('click', () => {
        $('.wrapper-pop-up').html('');
        const urlParams = getURLParameters();
        if (urlParams.sid) {
            delete urlParams.sid;
        }
        window.history.pushState({}, '', encodeURL(formatURL(window.location.href.split('?')[0], urlParams)));
    });
    document.getElementById('form-search').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = $('input[name="search-input"]').val();
        if (!val) {
            return;
        }
        window.location.href = window.location.origin + `/sketches?query=${val}`;
    });
    document.getElementById('nav-buttons-burger-short').addEventListener('click', (e) => {
        const btnsDropdown = document.getElementById('section-nav-buttons-dropdown-options-container-short');
        e.preventDefault();
        if ($(btnsDropdown).is(':hidden')) {
            $(btnsDropdown).show();
            $(btnsDropdown).css({left: -10}).animate({left: 0}, 200);
            $('.nav-buttons-burger-wrapper-short').fadeOut(100, () => {
                $('.nav-buttons-burger-close-wrapper-short').hide().fadeIn(100);
            });
        } else {
            $(btnsDropdown).animate({left: -10}, 100, () => {
                $(btnsDropdown).hide();
            });
            $('.nav-buttons-burger-close-wrapper-short').fadeOut(100, () => {
                $('.nav-buttons-burger-wrapper-short').hide().fadeIn(100);
            });
        }
    });
    addEventListener('click', (e) => {
        const sectionDropdown = document.getElementById('section-nav-buttons-dropdown-options-container-short');
        const navWrapper = document.getElementById('nav-wrapper');

        if (document.getElementsByClassName('btn-dropdown-close-container')[0].contains(e.target)) {
            document.getElementById('nav-buttons-burger-short').dispatchEvent(new Event('click'));
            return;
        }
        if ($(sectionDropdown).is(':animated') || $(sectionDropdown).is(':hidden')) {
            return;
        }
        if (e.clientX == undefined || e.clientY == undefined) {
            return;
        }

        if (!sectionDropdown.contains(e.target) && !navWrapper.contains(e.target)) {
            document.getElementById('nav-buttons-burger-short').dispatchEvent(new Event('click'));
        }
    });
}


main();
