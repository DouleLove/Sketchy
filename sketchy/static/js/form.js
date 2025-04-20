import {getBrightness, animateBrightness, animateOpacity, encodeURL, formatURL, getURLParameters} from './utils.js';

export function postForm(form, url=window.location.href, callback=null, additionalFields={}) {
    const xhr = new XMLHttpRequest();

    const formData = new FormData(form);
    for (let fld of Object.keys(additionalFields)) {
        if (additionalFields[fld] == undefined) {
            formData.delete(fld);
            continue;
        }
        formData.set(fld, additionalFields[fld]);
    }

    if (postForm._querying) {
        return;
    }

    postForm._querying = true;

    $.ajax({
        type: 'POST',
        url: url,
        data: formData,
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
        },
        error: () => {
            postForm._querying = false;
        },
    });
}


function setReferrer() {
    const url = window.location.href.split('?')[0];
    const parameters = getURLParameters();
    parameters['referrer'] = parameters.referrer || document.referrer || (window.location.origin + '/profile');
    window.history.replaceState({}, '', encodeURL(formatURL(url, parameters)));
}


setReferrer();
