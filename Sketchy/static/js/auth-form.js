import {getURLParameters, formatURL, encodeURL} from './utils.js'


function setSwitcher() {
    [].forEach.call(
        document.getElementsByClassName('switcher'),
        (elem) => elem.addEventListener('click', switchAuthTab)
    );
}


function setReferrer() {
    const url = window.location.href.split('?')[0];
    const parameters = getURLParameters();
    parameters['referrer'] = parameters.referrer || document.referrer || (window.location.origin + '/profile');
    window.history.replaceState({}, '', encodeURL(formatURL(url, parameters)));
}


function switchAuthTab() {
    const currentURLParams = getURLParameters();

    if ('n' in currentURLParams) {
        delete currentURLParams['n'];
    } else {
        currentURLParams['n'] = true;
    }

    const url = formatURL(window.location.href.split('?')[0], currentURLParams);
    $.get(url, (data) => {
        $('#auth-form-inner').slideUp(350,
            function() {
                $('#auth-form').html($(data).find('#auth-form-inner'));
                $('#auth-form-inner').hide().slideDown(350, setSwitcher);
            }
        )
    });

    window.history.replaceState({}, '', encodeURL(url));
}


function onSubmit(e) {
    e.preventDefault();

    const xhr = new XMLHttpRequest();

    $.ajax({
        type: 'POST',
        url: window.location.href,
        data: $(this).serialize(),
        xhr: function() { return xhr; },
        success: (data) => {
            if (xhr.responseURL !== window.location.href) {
                window.location.href = xhr.responseURL;  // server returned redirect, auth successful
                return;
            }

            $('#auth-form').html($(data).find('#auth-form-inner'));
            setSwitcher();
        }
    });
}


function main() {
    setSwitcher();
    setReferrer();
    document.getElementById('auth-form').addEventListener('submit', onSubmit);
}


main();
