import {getBrightness, animateBrightness, animateOpacity, encodeURL, formatURL, getURLParameters} from './utils.js';


export function postForm(form, url=window.location.href, callback=null) {
    const xhr = new XMLHttpRequest();

    $.ajax({
        type: 'POST',
        url: url,
        data: new FormData(form),
        processData: false,
        contentType: false,
        xhr: function() { return xhr; },
        async: true,
        cache: false,
        success: (data) => {
            if (xhr.responseURL !== window.location.href) {
                window.location.href = xhr.responseURL;  // server returned redirect
                return;
            }

            $('#form').html($(data).find('#form-inner'));
            if (callback) {
                callback();
            }
        }
    });
}


function setupAnimations() {
    animateOpacity(document.getElementById('background-container'), {0: 0, 0.2: 0, 1: 1});

    Array.from(document.getElementsByClassName('bg-icon')).concat(
        document.getElementById('form')
    ).forEach((element) => animateOpacity(element, {0: 0, 0.5: 0, 1: 1}));
}


function setReferrer() {
    const url = window.location.href.split('?')[0];
    const parameters = getURLParameters();
    parameters['referrer'] = parameters.referrer || document.referrer || (window.location.origin + '/profile');
    window.history.replaceState({}, '', encodeURL(formatURL(url, parameters)));
}


function main() {
    setReferrer();
    setupAnimations();
}

main();
