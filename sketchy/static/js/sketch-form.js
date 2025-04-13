import {postForm} from './form.js'
import {SketchesMap} from './sketches-map.js'
import {shortenText} from './utils.js'


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

        inp.val(shortenText(inp.get(0), selectedFile.name));
        inp.blur();
    });

    $('#image').trigger('change');
}


function setupPlaceInput(name, coordinates) {
    const placeInput = document.getElementById('place');

    const map = new SketchesMap(document.getElementById('map'), {
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
    placeInput.addEventListener('focus', () => map.show());

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
        kwargs[place] = placeCoordinates;
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
