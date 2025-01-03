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
        console.log(encodeURL(formatURL(window.location.href.split('?')[0], urlParams)));
        window.history.pushState({}, '', encodeURL(formatURL(window.location.href.split('?')[0], urlParams)));

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
    })
}


main();
