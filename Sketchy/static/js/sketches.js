import {getURLParameters, encodeURL, formatURL, loadSketchPopUp} from './utils.js';
import {SearchLoader} from './loaders.js';

var loader;


function reqLoad(additional=false, onsuccess=null, ignoreOnSameURL=true) {
    const query = $('.search-input').val();

    if (!loader || additional == false) {
        loader = new SearchLoader();
        loader.limit = 30;
        loader.query = query;
    }

    try {
        let cd = '';
        let href = window.location.origin + `/sketches`;
        if (query) {
            href += `?query=${query}`;
        }
        if (href == window.location.href && ignoreOnSameURL) {
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
                    $(r).children().each((i, elem) => elem.addEventListener('click',
                        (e) => loadSketchPopUp(e.currentTarget.getAttribute('data-sid')))
                    );
                }
            });
            if (!loader.active) {
                $('#btn-load-more').hide();
            } else {
                $('#btn-load-more').show();
            }
            window.history.pushState({}, '', href);
            if (onsuccess != null) {
                onsuccess();
            }
        });
    } catch (e) {
        if (e instanceof TypeError) {
            return;
        }
    }
}


function emitSearch(val) {
    $('input[name="search-input"]').val(val);
    const e = new Event('submit');
    e.ignoreOnSameURL = false;
    document.getElementById('form-search').dispatchEvent(e);
}


function main() {
    window.onpopstate = (e) => {
        emitSearch(getURLParameters(e.currentTarget.href).query);
    };
    document.getElementById('btn-load-more').addEventListener('click', () => {
        reqLoad(true);
    });
    let el = document.getElementById('form-search')
    let cloneNode = el.cloneNode(true);
    el.parentNode.replaceChild(cloneNode, el);
    document.getElementById('form-search').addEventListener('submit', (e) => {
        e.preventDefault();
        $('.search-input').blur();
        reqLoad(false, () => {
            if (!document.getElementById('container-sketches-inner-ctn').innerHTML) {
                const HTMLMsg = '<span class="msg-nothing-found">По вашему запросу ничего не найдено</span>';
                document.getElementById('container-sketches-inner-ctn').innerHTML = HTMLMsg;
            }
        }, e.ignoreOnSameURL ? true : false);
    });

    const sid = +(getURLParameters().sid || 0)
    if (sid) {
        loadSketchPopUp(sid);
    }

    const urlParams = getURLParameters();
    if (urlParams.query) {
        emitSearch(urlParams.query);
    } else {
        reqLoad(false, null, false);
    }
}


main();
