import {addRendered} from './base.js';
import {getURLParameters, formatURL, encodeURL, loadSketchPopUp} from './utils.js';
import {ViewLoader} from './loaders.js';
import {setupSketchPopUp} from './sketch.js';

var loader;


function loadMessages(data) {
    $('<div>' + data.rendered + '</div>').find('.response-status-message').each(function() {
        addRendered(this);
    });
}


function reqView(sender) {
    if (sender) {
        $('#section-content').hide();
        document.getElementById('views-container').innerHTML = '';
        loader = new ViewLoader();
        loader.view = sender.getAttribute('data-view');
        loader.limit = loader.view == 'sketches' ? 10 : 30;
    }
    const urlParams = getURLParameters();
    if (!urlParams.username) {
        urlParams.uid = $('meta[name="uid"]').attr('content');
    }
    urlParams.view = loader.view;
    const shareURL = encodeURL(formatURL(window.location.href.split('?')[0], urlParams));
    window.history.replaceState({}, '', shareURL);
    document.getElementById('view-title').innerHTML = {'sketches': 'Скетчи',
                                                       'followers': 'Подписчики',
                                                        'follows': 'Подписки'}[urlParams.view];
    if (document.getElementById('btn-add-sketch')) {
        if (urlParams.view == 'sketches') {
            document.getElementById('btn-add-sketch').style.display = 'block';
        } else {
            document.getElementById('btn-add-sketch').style.display = 'none';
        }
    }

    try {
        if (loader.active) {
            $('#wrapper-btn-load-more').show();
        }
        loader.request().then((data) => {
            $('#views-container').append(data.rendered);
            if (!$.trim($('#views-container').html()).length) {
                $('#views-container').append('<p class="nothing-msg">Здесь пока ничего нет</p>')
            }
            if (!loader.active) {
                $('#wrapper-btn-load-more').hide();
            }
            [].forEach.call(
                document.getElementsByClassName('sketch-item'),
                (i) => i.onclick = (e) => loadSketchPopUp(e.currentTarget.getAttribute('data-sid'))
            );
            if ($('#section-content').is(':hidden')) {
                $('#section-content').show();
            }
        });
    } catch (e) {
        if (e instanceof TypeError) {
            return;
        }
    }
}


function handlePostResponse(data) {
    for (let name in data.errors || []) {
        $(`.f-editable[name='${name}']`).parent().next().addClass('error');
    }

    loadMessages(data);
}


function reqPost(form, onsuccess=handlePostResponse, onerror=handlePostResponse) {
    const formData = new FormData();

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
                    onsuccess(data);
                }
                return;
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
            inp.addEventListener('focus', (e) => {
                e.currentTarget.setAttribute('data-value-onfocus', e.currentTarget.value);
            });
            inp.addEventListener('focusout', (e) => {
                e.preventDefault();
                if (e.currentTarget.getAttribute('data-value-onfocus') != e.currentTarget.value) {
                    reqPost(e.currentTarget.parentElement, function(tgt, data) {
                        handlePostResponse(data);
                        if (tgt.id !== 'user-visible-username') {
                            return;
                        }
                        [].forEach.call(
                            document.getElementsByClassName('author-username') || [],
                            (elem) => elem.innerHTML = tgt.value
                        );
                        tgt.removeAttribute('data-value-onfocus');
                    }.bind(this, e.currentTarget));
                } else {
                    e.currentTarget.removeAttribute('data-value-onfocus');
                }
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
    addEventListener('keydown', (e) => {
        if (e.key != 'Enter') {
            return;
        }
        if (e.key == 'Enter' && document.activeElement.classList.contains('f-editable')) {
            e.preventDefault();
        }
    });
}


function userInfoMoreButton() {
    let x = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    if (!x) {
        return;
    }

    let show;
    if (x > 650) {
        show = true;
    } else {
        show = false;
    }

    [...document.getElementsByClassName('btn-more-pu')].forEach(
        (btn) => btn.style.display = show ? 'block' : 'none'
    );
}


function main() {
    const sid = +(getURLParameters().sid || 0);
    if (sid) {
        loadSketchPopUp(sid);
    }

    setFavoritesSwitcher();
    setupEditable();
    userInfoMoreButton();
    window.onresize = (e) => {
        [].forEach.call(
            document.getElementsByClassName('f-editable'),
            (elem) => elem.dispatchEvent(
                new Event('input', {view: window, bubbles: true, cancelable: false})
            )
        );
        userInfoMoreButton();
    }
    window.dispatchEvent(new Event('resize'));
    document.getElementsByClassName('wrapper-avatar')[0].addEventListener('click', (e) => {
            const inp = document.getElementById('input-load-avatar');
            if (!inp) {
                return;
            }
            inp.addEventListener('cancel', (e) => {
                if (e.handled == true) {
                    return;
                }
                e.handled = true;
                e.currentTarget.dispatchEvent(new Event('change'))
            });
            inp.addEventListener('change',
                (e) => {
                    if (e.handled == true) {
                        return;
                    }
                    e.handled = true;
                    reqPost(e.currentTarget.parentElement, function(response) {
                        let upl = document.getElementById('user-avatar').src.split('/').slice(0, -1).join('/');
                        if (upl.includes('/static/img')) {
                            upl = upl.split('/').slice(0, -2).join('/') + '/media/avatars';
                        }
                        const pt = upl + '/' + response.user_data.avatar;
                        document.getElementById('user-avatar').src = pt;
                        document.getElementById('user-avatar-pr').src = pt;

                        handlePostResponse(response);
                    });
                });
            inp.click();
        }
    );
    [].forEach.call(
        document.getElementsByClassName('fake-link'),
        (flk) => flk.addEventListener('click', (e) => reqView(e.currentTarget))
    );

    let dispatcher = $(`.fake-link[data-view="${getURLParameters().view}"]`);
    dispatcher = (dispatcher.length ? dispatcher : $('.fake-link').first()).get(0);
    dispatcher.dispatchEvent(new Event('click'));
    document.getElementById('btn-load-more').addEventListener('click', () => {
        reqView();
    });
    const btnShare = document.getElementById('button-share');
    btnShare.addEventListener('click', (e) => {
        let href = window.location.href;
        const partial = href.split('?')[0];
        const urlParams = getURLParameters();
        delete urlParams.view
        href = encodeURL(formatURL(partial, urlParams))
        window.navigator.clipboard.writeText(href);
    });
    var ticksFromLastScrollLoad = 100000;
    addEventListener('scroll', (e) => {
        if (ticksFromLastScrollLoad < 3) {
            ticksFromLastScrollLoad += 1;
            return;
        }
        const totalHeight = $(document).height();
        const scrollY = window.scrollY;
        if (totalHeight - scrollY < 2000) {
            $('#btn-load-more').click();
        }
        ticksFromLastScrollLoad = 0;
    });
}


main();
