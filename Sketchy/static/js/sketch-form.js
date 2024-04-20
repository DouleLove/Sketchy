import {postForm} from './form.js'


function setupFileInput(selectedFile) {
    [].forEach.call(
        document.getElementsByClassName('form-field-input-file-icon-add'),
        (elem) => elem.addEventListener('click', (e) => {
            $(e.currentTarget).closest('.form-field-inner').find('.form-field-input[type="text"]').focus();
        })
    );
    $('.form-field-wrapper:has(.form-field-inner > .form-field-input[type="file"])').on('click', (e) =>
        {
            const closestFileInput = $(e.currentTarget).find('.form-field-input[type="file"]');
            if (e.target == closestFileInput) {
                return;
            }
            $(closestFileInput).get(0).click();
        });
    $('#image').on('change', (e) => {
        const inp = $(e.currentTarget).next();

        if (e.currentTarget.files.length) {
            selectedFile = e.currentTarget.files[0];
        }

        if (!selectedFile) {
            return;
        }

        const fullname = selectedFile.name;
        const shortname = fullname.split('.').slice(0, -1).join('.');
        let val;
        if (shortname.length > 12) {
            const ext = fullname.split('.').pop();
            val = shortname.slice(0, 7) + '...' + shortname.slice(-5, shortname.length) + '.' + ext;
        } else {
            val = fullname;
        }

        inp.val(val);
        inp.blur();
    });

    $('#image').trigger('change');
}


function onSubmit(e) {
    e.preventDefault();

    const f = document.getElementById('image').files.length ? document.getElementById('image').files[0] : undefined;
    postForm(this, window.location.href, () => setupFileInput(f));
}


function main() {
    setupFileInput();
    document.getElementById('form').addEventListener('submit', onSubmit);
}


main();
