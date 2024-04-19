import {getURLParameters, formatURL, encodeURL} from './utils.js';
import {postForm} from './form.js'


function setSwitcher() {
    [].forEach.call(
        document.getElementsByClassName('switcher'),
        (elem) => elem.addEventListener('click', switchAuthTab)
    );
}


function setPwTogglers() {
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


function switchAuthTab() {
    const currentURLParams = getURLParameters();

    if ('n' in currentURLParams) {
        delete currentURLParams['n'];
    } else {
        currentURLParams['n'] = true;
    }

    const url = formatURL(window.location.href.split('?')[0], currentURLParams);
    $.get(url, (data) => {
        $('#form-inner').slideUp(350,
            function() {
                $('#form').html($(data).find('#form-inner'));
                $('#form-inner').hide().slideDown(350, setSwitcher);
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

    postForm(this, window.location.href, () => {setSwitcher(); setPwTogglers();});
}


function main() {
    setSwitcher();
    setPwTogglers();
    document.getElementById('form').addEventListener('submit', onSubmit);
}


main();
