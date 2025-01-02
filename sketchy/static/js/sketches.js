import {getURLParameters, encodeURL, formatURL, loadSketchPopUp} from './utils.js';
import {SearchLoader} from './loaders.js';

var loader;


function reqLoad(additional=false, onsuccess=null, ignoreOnSameURL=true, updateURL=true) {
    const query = $('.search-input').val();

    if (!loader || additional == false) {
        loader = new SearchLoader();
        loader.limit = 30;
        loader.query = query;
    }

    try {
        let cd = '';
        let href = window.location.origin + `/sketches`;
        const curHrefParams = getURLParameters(window.location.href);
        if (curHrefParams.sid) {
            delete curHrefParams.sid;
        }
        const curHrefNoSid = formatURL(window.location.href.split('?')[0], curHrefParams);
        if (query) {
            href += `?query=${query}`;
        }
        if (
            getURLParameters().sid && encodeURL(href) == encodeURL(curHrefNoSid)
            || (href == window.location.href && ignoreOnSameURL)
        ) {
            return;
        }
        loader.request().then((data) => {
            if (additional == false) {
                $('#container-sketches-inner-ctn').empty();
            }
            let d = $('<div>' + data.rendered + '</div>').find('.sketch-item');
            let l_ = d.length;
            d.each((i, elem) => {
                cd += $(elem).get(0).outerHTML;
                let e = '<div class="sketches-row">' + cd + '</div>';
                if ($(e).find('.sketch-item').length == 2) {
                    cd = '';
                    $('#container-sketches-inner-ctn').append(e);
                }
                if (i == l_ - 1 && $(e).find('.sketch-item').length == 1) {
                    $('#container-sketches-inner-ctn').append(e);
                }
                const r = $('#container-sketches-inner-ctn').children().last();
                if (r) {
                    $(r).children().each((i, elem) => {elem.onclick =
                        (e) => {
                            e.preventDefault();
                            loadSketchPopUp(e.currentTarget.getAttribute('data-sid'))
                        }
                    });
                }
            });
            if (!loader.active) {
                $('#btn-load-more').hide();
            } else {
                $('#btn-load-more').show();
            }
            if (updateURL) {
                window.history.pushState({}, '', encodeURL(href));
            }
            if (onsuccess != null) {
                onsuccess();
            }
            if ($('#section-sketches').is(':hidden')) {
                $('#section-sketches').show()
            }
        });
    } catch (e) {
        if (e instanceof TypeError) {
            return;
        }
    }
}


function emitSearch(val, updateURL=true) {
    $('input[name="search-input"]').val(val);
    const e = new Event('submit');
    e.ignoreOnSameURL = false;
    e.updateURL = updateURL;
    document.getElementById('form-search').dispatchEvent(e);
}


function main() {
    addEventListener('popstate', (e) => {
        emitSearch(getURLParameters(e.currentTarget.href).query, false);
    })
    document.getElementById('btn-load-more').addEventListener('click', () => {
        reqLoad(true, null, false, false);
    });
    let el = document.getElementById('form-search');
    let cloneNode = el.cloneNode(true);
    el.parentNode.replaceChild(cloneNode, el);
    document.getElementById('form-search').addEventListener('submit', (e) => {
        if (e.updateURL == undefined) {
            e.updateURL = true;
        }
        if (e.ignoreOnSameURL == undefined) {
            e.ignoreOnSameURL = true;
        }
        e.preventDefault();
        $('.search-input').blur();
        reqLoad(false, () => {
            if (!document.getElementById('container-sketches-inner-ctn').innerHTML) {
                const HTMLMsg = '<span class="msg-nothing-found">По вашему запросу ничего не найдено</span>';
                document.getElementById('container-sketches-inner-ctn').innerHTML = HTMLMsg;
            }
        },
        e.ignoreOnSameURL ? true : false,
        e.updateURL ? true : false);
    });

    const sid = +(getURLParameters().sid || 0);
    if (sid) {
        loadSketchPopUp(sid);
    }

    const urlParams = getURLParameters();
    if (urlParams.query) {
        emitSearch(urlParams.query);
    } else {
        reqLoad(false, null, false, false);
    }
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
