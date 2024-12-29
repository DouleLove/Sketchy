import {getURLParameters, encodeURL, formatURL, loadSketchPopUp} from './utils.js';
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
        window.history.replaceState({}, '', encodeURL(formatURL(window.location.href.split('?')[0], urlParams)));

        if (onsuccess != null) {
            onsuccess();
        }
    });
}


function markActiveNavButton() {
    const currentUrl = window.location.href.split('?')[0];
    const navButtons = document.getElementsByClassName('nav-btn');

    for (const btn of navButtons) {
        if (btn.href == currentUrl) {
            const uid = $('meta[name="uid"]').attr('content');
            const cuuid = $('meta[name="cu-uid"]').attr('content');
            if (uid && cuuid && uid !== cuuid) {
                return;
            }
            btn.onclick = (e) => {e.preventDefault()};
            return btn.classList.add('active');
        }
    }
}


function main() {
    markActiveNavButton();
    window.history.replaceState({}, '', encodeURL());
    $('#btn-pop-up-close').on('click', () => {
        $('.wrapper-pop-up').html('');
        const urlParams = getURLParameters();
        if (urlParams.sid) {
            delete urlParams.sid;
        }
        window.history.replaceState({}, '', encodeURL(formatURL(window.location.href.split('?')[0], urlParams)));
    });
    document.getElementById('form-search').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = $('input[name="search-input"]').val();
        if (!val) {
            return;
        }
        window.location.href = window.location.origin + `/sketches?query=${val}`;
    })
}


main();
