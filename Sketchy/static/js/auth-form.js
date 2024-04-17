import {getURLParameters, formatURL, encodeURL} from './utils.js';


function setSwitcher() {
    [].forEach.call(
        document.getElementsByClassName('switcher'),
        (elem) => elem.addEventListener('click', switchAuthTab)
    );
}


function setPwTogglers() {
    document.getElementById('auth-form').addEventListener('submit', onSubmit);
    [].forEach.call(
        document.getElementsByClassName('eye-switch-pw-type'),
        (elem) => elem.addEventListener('click', (e) => {
            const fld = e.currentTarget.previousElementSibling;
            const line = e.currentTarget.children[1];
            if (line.hasAttribute('checked')) {
                fld.setAttribute('type', 'password');
                line.removeAttribute('checked');
            } else {
                fld.setAttribute('type', 'text');
                line.setAttribute('checked', '');
            }
        })
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
                setPwTogglers();
                setSwitcher();
            }
        )
    });

    window.history.replaceState({}, '', encodeURL(url));
}


function onSubmit(e) {
    e.preventDefault();
    document.getElementById('password').setAttribute('type', 'password');

    const xhr = new XMLHttpRequest();

    $.ajax({
        type: 'POST',
        url: window.location.href,
        data: $(this).serialize(),
        xhr: function() { return xhr; },
        async: true,
        cache: false,
        success: (data) => {
            if (xhr.responseURL !== window.location.href) {
                window.location.href = xhr.responseURL;  // server returned redirect, auth successful
                return;
            }

            $('#auth-form').html($(data).find('#auth-form-inner'));
            setSwitcher();
            setPwTogglers();
        }
    });
}


function main() {
    setSwitcher();
    setReferrer();
    setPwTogglers();
}


main();
