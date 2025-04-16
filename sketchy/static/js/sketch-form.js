import {loadPopUp} from './base.js'
import {postForm} from './form.js'
import {SketchesMap} from './sketches-map.js'
import {shortenText} from './utils.js'


function isImage(file) {
    return file['type'].split('/')[0] == 'image';
}


function addCropGrid(toElement, cellsNum=9) {
    const cropGridContainer = $('<div>').attr({'class': 'editor-image-crop-grid-container'}).css({
        'position': 'absolute', 'pointer-events': 'auto', 'top': '0', 'left': '0'
    });
    const cropGrid = $('<div>').attr({'class': 'crop-grid'}).css({
        'display': 'grid', 'pointer-events': 'none', 'width': '100%', 'height': '100%',
        'grid-template-rows': 'repeat(3, 1fr)', 'grid-template-columns': 'repeat(3, 1fr)'
    });
    const container = $('<div>').attr({'class': 'grid-resizes-container'}).css({
        'width': '100%', 'height': '100%', 'position': 'absolute', 'top': '0', 'left': '0'
    });

    $(toElement).append(cropGridContainer)
    $(cropGridContainer).append(cropGrid)
    $(cropGridContainer).append(container);

    for (let i = 0; i < cellsNum; i++) {
        cropGrid.append($('<div>').attr({'class': 'crop-grid-cell'}).css({
            'border': '1px solid rgba(187, 194, 185, .4)'
        }));
    }

    container.css('cursor', 'grab');
    const resizeControlsClass = 'crop-grid-resize-control';
    const resizeControlsIds = ['nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'];
    const controlSize = 12;  // px
    const border = '1px solid rgba(187, 194, 185)';
    resizeControlsIds.forEach(function (cid) {
        let control = $('<div>').attr({'class': resizeControlsClass, 'id': cid}).css('position', 'absolute');
        if (cid.indexOf('n') !== -1) {
            control.css('top', -controlSize / 2 + 'px').css('border-top', border);
        }
        if (cid.indexOf('w') !== -1) {
            control.css('left', -controlSize / 2 + 'px').css('border-left', border);
        }
        if (cid.indexOf('s') !== -1) {
            control.css('top', `calc(100% + ${controlSize / 2 - controlSize}px)`).css('border-bottom', border);
        }
        if (cid.indexOf('e') !== -1) {
            control.css('left', `calc(100% + ${controlSize / 2 - controlSize}px)`).css('border-right', border);
        }
        control.css('width', controlSize + 'px');
        control.css('height', controlSize + 'px');
        control.css('cursor', 'nwse'.indexOf(cid) !== -1 ? 'nwse-resize' : 'nesw-resize');
        if (cid.length == 1) {
            control.css({'border': 'none', 'display': 'flex', 'justify-content': 'center', 'align-items': 'center'});
            if (!control.css('left')) {
                control.css('left', controlSize + 'px');
                $(container).on('resize', function (c, e) {
                    c.css('width', `calc(100% - ${controlSize * 2 + 'px'})`);
                }.bind(this, control)).trigger('resize');
                control.css('cursor', 'ns-resize');
                control.append(
                    $('<div>').css({
                        'width': controlSize * 2, 'height': '100%'
                    }).css(`border-${cid == 'n' ? 'top' : 'bottom'}`, border)
                );
            }
            if (!control.css('top')) {
                control.css('top', controlSize + 'px');
                $(container).on('resize', function (c, e) {
                    c.css('height', `calc(100% - ${controlSize * 2 + 'px'})`);
                }.bind(this, control)).trigger('resize');
                control.css('cursor', 'ew-resize');
                control.append(
                    $('<div>').css({
                        'height': controlSize * 2, 'width': '100%'
                    }).css(`border-${cid == 'w' ? 'left' : 'right'}`, border)
                );
            }
        }
        container.append(control);
    });

    let prevMouseX;
    let prevMouseY;

    $(container).mousedown(function (e) {
        if (e.button !== 0 && e.button !== 2) {
            return;
        }

        if (e.target == e.currentTarget) {
            $(cropGridContainer).addClass('draggable');
            $(container).css('cursor', 'grabbing');
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        } else {
            let controlId = $(e.target).attr('id') || $(e.target).parent().attr('id');
            $(cropGridContainer).addClass(`resizable with-${controlId}`);
            $(container).css('cursor', $(e.target).css('cursor'));
        }
    });

    $(document).mouseup(function (e) {
        if (e.button !== 0 && e.button !== 2) {
            return;
        }

        $(cropGridContainer).removeClass().addClass('editor-image-crop-grid-container');
        $(container).css('cursor', 'grab');
    });

    // resizing grid as soon as possible by trying to fire resize event every 30 ms for 2 seconds
    // and if image was loaded, then grid will take its size (or its width if height > width)
    const resizeIntervalID = setInterval(function (e) {
        if ($(toElement).width() > $(toElement).height()) {
            $(cropGridContainer).css({right: 0, bottom: 0});
        } else {
            $(cropGridContainer).css({right: 0, bottom: $(toElement).height() - $(toElement).width()});
        }
    }, 30);
    setTimeout(function () {clearInterval(resizeIntervalID)}, 500);

    function _getGridRect(_params={}) {
        const _rect = {};
        for (const _param of ['top', 'left', 'bottom', 'right']) {
            if ((_params[_param] !== undefined && _params[_param] < 0)) {
                _params[_param] = 0;
            }
            _rect[_param] = _params[_param] !== undefined ? _params[_param] : $(cropGridContainer).css(_param);
            if (typeof _rect[_param] === 'string') {
                _rect[_param] = parseFloat(_rect[_param].slice(0, _rect[_param].indexOf('px')));
            }
        }
        return _rect;
    }

    $(document).on('mousemove', function (e) {
        if ($(cropGridContainer).hasClass('draggable')) {
            const rect = _getGridRect();
            let mouseDiffY = e.clientY - prevMouseY;
            let mouseDiffX = e.clientX - prevMouseX;
            prevMouseY = e.clientY;
            prevMouseX = e.clientX;
            if (mouseDiffX < 0 && rect.left + mouseDiffX < 0) {
                mouseDiffX = -rect.left;
            }
            if (mouseDiffY < 0 && rect.top + mouseDiffY < 0) {
                mouseDiffY = -rect.top;
            }
            if (mouseDiffX > 0 && rect.right - mouseDiffX < 0) {
                mouseDiffX = rect.right;
            }
            if (mouseDiffY > 0 && rect.bottom - mouseDiffY < 0) {
                mouseDiffY = rect.bottom;
            }
            rect.left += mouseDiffX;
            rect.right -= mouseDiffX;
            rect.top += mouseDiffY;
            rect.bottom -= mouseDiffY;
            $(cropGridContainer).css(rect);
        }
        let withControl;
        $(cropGridContainer).attr('class').split(/\s+/).forEach((cls) => {
            if (cls.indexOf('with') !== -1) {
                withControl = cls.slice(5);  // cut with- and obtaining control id
            }
        });
        if (!withControl) {
            return;
        }
        const params = {};
        const parentBounds = $(toElement).get(0).getBoundingClientRect();
        if (withControl.indexOf('n') !== -1) {
            params.top = e.clientY - parentBounds.top;
        }
        if (withControl.indexOf('w') !== -1) {
            params.left = e.clientX - parentBounds.left;
        }
        if (withControl.indexOf('s') !== -1) {
            params.bottom = parentBounds.bottom - e.clientY;
        }
        if (withControl.indexOf('e') !== -1) {
            params.right = parentBounds.right - e.clientX;
        }
        const rect = _getGridRect(params);
        const w = $(toElement).width() - rect.left - rect.right;
        const h = $(toElement).height() - rect.top - rect.bottom;
        if (h > w || w < $(toElement).width() * 0.15 || h < $(toElement).height() * 0.15) {
            return;
        }
        $(cropGridContainer).css(params);
    });
}


function openImageEditor(file) {
    return new Promise((resolve, reject) => {
        if (!isImage(file)) {
            reject(new Error('Given file is not an image'));
        }

        const blob = URL.createObjectURL(file);

        const editorContainer = $('<div>').attr({'class': 'editor-container'});
        const editor = $('<div>').attr({'class': 'editor'});
        const imageContainer = $('<div>').attr({'class': 'editor-image-container'});
        const image = $('<img>').attr({'class': 'editor-image', 'id': 'editor-image', 'src': blob});
        const editorToolsPanel = $('<div>').attr({'class': 'editor-tools-panel'}).css({
            'display': 'flex', 'justify-content': 'center', 'width': '100%', 'margin-top': 35,
        });
        const closeBtnContainer = $('<div>').attr({'class': 'editor-button-container', 'id': 'close'}).css({
            'width': 25, 'height': 25, 'margin-inline': 20, 'cursor': 'pointer',
        });
        const closeBtn = '<svg fill="rgba(235, 237, 240, .8)" height="100%" width="100%" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" xml:space="preserve"><polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/></svg>'
        closeBtnContainer.get(0).innerHTML = closeBtn;
        const applyBtnContainer = $('<div>').attr({'class': 'editor-button-container', 'id': 'apply'}).css({
            'width': 25 , 'height': 25, 'margin-inline': 20, 'cursor': 'pointer',
        });
        const applyBtn = '<svg fill="rgba(235, 237, 240, .8)" width="100%" height="100%" viewBox="5 5 38 38" version="1" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 48 48"><polygon points="40.6,12.1 17,35.7 7.4,26.1 4.6,29 17,41.3 43.4,14.9"/></svg>'
        applyBtnContainer.get(0).innerHTML = applyBtn;

        [closeBtnContainer, applyBtnContainer].forEach(function (elem) {
            $(elem).mouseenter(function () {
                $(this).children().css('fill', 'rgb(91, 133, 227)');
            }.bind(elem));
            $(elem).mouseleave(function () {
                $(this).children().css('fill', 'rgba(235, 237, 240, .8)');
            }.bind(elem));
        });

        $(closeBtnContainer).on('click', function () {
            $(editorContainer).remove();
            reject(new Error('Image editing cancelled'))
        });

        $(applyBtnContainer).on('click', function () {
            const res = [
                $('.crop-grid').get(0).getBoundingClientRect(),
                $(imageContainer).get(0).getBoundingClientRect(),
                blob,
            ];
            $(editorContainer).remove();
            resolve(res);
        });

        $('.wrapper-pop-up').append(editorContainer);
        $(editorContainer).append(editor);
        $(editor).append(imageContainer);
        $(imageContainer).append(image);
        addCropGrid(imageContainer);
        $(editor).append(editorToolsPanel);
        $(editorToolsPanel).append(closeBtnContainer);
        $(editorToolsPanel).append(applyBtnContainer);

    //    inp.val(shortenText(inp.get(0), selectedFile.name));
    //    inp.blur();
    });
}


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

        openImageEditor(selectedFile).then(([cropBounds, originalBounds, blob]) => {
            e.currentTarget.dataset.blob = blob;
            e.currentTarget.dataset.crop = [
                Math.ceil(cropBounds.top),
                Math.ceil(cropBounds.left),
                Math.floor(cropBounds.bottom),
                Math.floor(cropBounds.right),
            ].join(',');
            e.currentTarget.dataset.imsize = [
                Math.ceil(originalBounds.width),
                Math.ceil(originalBounds.height),
            ].join(',')
        });
    });

    $('#image').trigger('change');
}


function setupPlaceInput(name, coordinates) {
    const placeInput = document.getElementById('place');

    let map;
    if (!setupPlaceInput.map) {
         map = setupPlaceInput.map = new SketchesMap(document.getElementById('map'), {
            singleMarker: true,
            showOnInit: false,
            setPlacemarkOnclick: true,
            placemarkDefaultBackgroundImage: $('meta[name="placemark-default-background-image"]')[0].content,
            placemarkDefaultForegroundImage: $('link[rel="icon"]')[0].href,
            placemarkDefaultBackgroundSize: [37, 67],
            placemarkDefaultBackgroundOffset: [-15, -50],
            placemarkDefaultForegroundSize: [35, 35],
            placemarkDefaultForegroundOffset: [-14, -41],
            placemarkBalloonDefaultText: 'Выбрать',
            placemarkBalloonOffset: [5, 5],
        });
        map.show = function (show) {
            document.getElementById('background-container').style.opacity = 0;
            show.bind(this)();
        }.bind(map, map.show);
        map.hide = function (hide) {
            document.getElementById('background-container').style.opacity = 1;
            hide.bind(this)();
        }.bind(map, map.hide);
        map.onSelect = (place) => {
            map.hide();
            let displayText = place.name;
            const cordsStr = `${place.coordinates[0]},${place.coordinates[1]}`;
            if (!displayText) {
                displayText = cordsStr;
            }
            const inp = document.getElementById('place');
            inp.value = shortenText(inp, displayText);
            inp.dataset.coordinates = cordsStr;
        }
    } else {
        map = setupPlaceInput.map;
    }
    placeInput.addEventListener('click', () => map.show());

    if (name) {
        placeInput.value = name;
    }
    if (coordinates) {
        placeInput.dataset.coordinates = coordinates;
    }
}


function onSubmit(e) {
    e.preventDefault();

    const f = document.getElementById('image').files.length ? document.getElementById('image').files[0] : undefined;
    const placeInput = document.getElementById('place');
    let placeName = placeInput.value;
    const placeCoordinates = placeInput.dataset.coordinates;
    const kwargs = {};
    if (placeCoordinates) {
        kwargs.place = placeCoordinates;
    }
    if (!placeName) {
        placeName = '';
    }
    postForm(this, window.location.href, () => {
        setupFileInput(f);
        setupPlaceInput(placeName, placeCoordinates);
    }, kwargs);
}


function main() {
    setupFileInput();
    setupPlaceInput();
    document.getElementById('form').addEventListener('submit', onSubmit);
}

main();
