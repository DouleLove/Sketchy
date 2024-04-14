function handlePostError(data) {
    for (let name in data.errors) {
        $(`.f-editable[name='${name}']`).parent().next().addClass('error');
    }
}


function reqPost(form, onsuccess=undefined, onerror=handlePostError) {
    formData = new FormData();

    [].forEach.call(
        form.children,
        (child) => {
            let name = child.name;
            let value = child.value;
            formData.append(name, value);
            if (child.files) {
                formData.append(name + '-attachment', child.files[0]);
            }
        }
    );

    $.ajax({
        type: 'POST',
        url: window.location.href,
        data: formData,
        processData: false,
        contentType: false,
        async: true,
        cache: false,
        success: (data) => {
            if (data.status == 200) {
                if (onsuccess) {
                    return onsuccess(data);
                }
            }
            if (onerror) {
                return onerror(data);
            }
        }
    });
}


function setFavoritesSwitcher() {

    function _switchState(changeCounter=true) {
        const elem = itf;
        const cls = 'icon-supports-fill';
        let flwsNum = document.getElementById('followers-num');

        if (elem.parentElement.value == 'true') {
            elem.classList.remove(cls);
            elem.parentElement.setAttribute('data-title', 'Подписаться');
            elem.parentElement.value = false;
            if (changeCounter) {
                flwsNum.innerHTML = +flwsNum.innerHTML - 1;
            }
        } else {
            elem.classList.add(cls);
            elem.parentElement.setAttribute('data-title', 'Отписаться');
            elem.parentElement.value = true;
            if (changeCounter) {
                flwsNum.innerHTML = +flwsNum.innerHTML + 1;
            }
        }

        const tt = document.getElementById('followers-m');
        flwsNum = +flwsNum.innerHTML
        if (flwsNum % 10 == 1 && flwsNum != 11) {
            tt.innerHTML = 'Подписчик';
        } else if (flwsNum == 3 || flwsNum == 4 || flwsNum != 12 && flwsNum % 10 == 2) {
            tt.innerHTML = 'Подписчика';
        } else {
            tt.innerHTML = 'Подписчиков';
        }
    }

    const itf = document.getElementById('icon-to-favorites');
    if (itf) {
        itf.parentElement.addEventListener('click',
            (e) => {
                e.preventDefault();
                reqPost(e.currentTarget.parentElement, () => _switchState());
            }
        );
        if (itf.parentElement.value == 'true') {
            itf.parentElement.value = 'false';
            _switchState(false);
        }
    }
}


function setupEditable() {
    [].forEach.call(
        document.getElementsByClassName('editable-field'),
        (elem) => {
            const inp = elem.children[0].children[1];
            elem.addEventListener('click', (e) => {
                const inp = e.currentTarget.children[0].children[1];
                if (inp != document.activeElement) {
                    inp.focus();
                    // setting cursor to the end of line
                    let val = inp.value;
                    inp.value = '';
                    inp.value = val;
                }
            });
            inp.addEventListener('focusout', (e) => {
                reqPost(e.currentTarget.parentElement);
            });
            inp.addEventListener('input', (e) => {
                const iconEdit = e.currentTarget.parentElement.nextElementSibling;
                if (e.currentTarget.value && iconEdit.classList.contains('error')) {
                    iconEdit.classList.remove('error');
                }

                e.currentTarget.style.height = 0;
                e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";

                const lht = parseInt($(e.currentTarget).css('lineHeight'), 10);
                const lines = $(e.currentTarget).prop('scrollHeight') / lht;
            });
        }
    );
}


function main() {
    setFavoritesSwitcher();
    setupEditable();
    window.onresize = (e) => {
        [].forEach.call(
            document.getElementsByClassName('f-editable'),
            (elem) => elem.dispatchEvent(
                new Event('input', {view: window, bubbles: true, cancelable: false})
            )
        );
    }
    window.dispatchEvent(new Event('resize'));
    document.getElementsByClassName('wrapper-avatar')[0].addEventListener('click', (e) => {
            const inp = document.getElementById('input-load-avatar');
            if (!inp) {
                return;
            }
            inp.addEventListener('change',
                (e) => {
                    reqPost(e.currentTarget.parentElement, function(response) {
                        const upl = document.getElementById('user-avatar').src.split('/').slice(0, -1).join('/');
                        const pt = upl + '/' + response.data.avatar
                        document.getElementById('user-avatar').src = pt;
                        document.getElementById('user-avatar-pr').src = pt;
                    });
                }, {once: true});
            inp.click();
        }
    );
}


main();
