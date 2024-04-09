import {getURLParameters, formatURL} from './utils.js'


function setSwitcher() {
    [].forEach.call(
        document.getElementsByClassName('switcher'),
        (elem) => elem.addEventListener('click', switchAuthTab)
    );
}


function updateURL(url, parameters) {
    if (url == undefined) {
        url = window.location.href.split('?')[0];
    }

    if (!('referrer' in parameters)) {
        parameters['referrer'] = document.referrer || window.location.origin;
    }

    url = formatURL(url, parameters)
    window.history.replaceState({}, '', encodeURI(url));

    return url
}


function switchAuthTab() {
    const currentURLParams = getURLParameters();

    if ('n' in currentURLParams) {
        delete currentURLParams['n'];
    } else {
        currentURLParams['n'] = true;
    }

    const url = updateURL(undefined, currentURLParams);
    $.get(url, (data) => {
        $('#auth-form-inner').slideUp(350,
            function() {
                $('#auth-form').html($(data).find('#auth-form-inner'));
                $('#auth-form-inner').hide().slideDown(350, setSwitcher);
            }
        )
    });
}

setSwitcher();
updateURL(undefined, getURLParameters());
