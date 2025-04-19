import {addRendered} from './base.js';
import {getURLParameters, formatURL, encodeURL} from './utils.js'

function setSketchImage() {
    const imageElement = document.getElementsByClassName('sketch-image-popup')[0];

    let x = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    let imageSize;
    if (!x) {
        imageSize = "large";
    } else if (x <= 650) {
        imageSize = "small";
    } else if (x <= 1300) {
        imageSize = "medium";
    } else {
        imageSize = "large";
    }

    if (imageElement.dataset.size == imageSize) {
        return;
    }

    const imageSrc = `media/${imageSize}/${imageElement.dataset.imname}`;
    imageElement.setAttribute('src', imageSrc);
    imageElement.dataset.size = imageSize;
}


function setupButtonSketchPlace() {
    const btnSketchPlace = document.getElementById('btn-sketch-place');

    if (!btnSketchPlace) {
        return;
    }

    let btnSketchPlaceRedirURL = encodeURL(
        window.location.origin + `/imap?coordinates=${btnSketchPlace.dataset.coordinates}`,
    );
    if (window.location.pathname.indexOf('imap') !== -1) {
        let coordinates = btnSketchPlace.dataset.coordinates;
        // ymaps for some reason reverse ll parameter
        coordinates = coordinates.split(',').reverse().join(',');
        // if sketch popup is already opened from imap page, then redirect to original yandex maps page
        btnSketchPlaceRedirURL = encodeURL(
            `https://yandex.ru/maps?ll=${coordinates}&pt=${coordinates}&z=15`,
        );
        btnSketchPlace.style.fill = '#e67467';
        btnSketchPlace.dataset.title = 'Открыть Яндекс карты';
        btnSketchPlace.addEventListener('click', () => {window.open(btnSketchPlaceRedirURL, '_blank');})
    }
    btnSketchPlace.addEventListener('click', () => {window.location.href = btnSketchPlaceRedirURL;})
}


export function setupSketchPopUp() {
    setSketchImage();
    window.addEventListener('resize', setSketchImage);
    setupButtonSketchPlace();
    document.getElementById('btn-share-sketch').addEventListener('click', (e) => {
        const kwargs = {};
        let pathname;
        kwargs.sid = getURLParameters().sid;
        const btnSketchPlace = document.getElementById('btn-sketch-place');
        if (btnSketchPlace) {
            kwargs.coordinates = btnSketchPlace.dataset.coordinates;
            pathname = '/imap';
        } else {
            kwargs.uid = getURLParameters(document.getElementsByClassName('author-avatar-wrapper')[0].href).uid;
            pathname = '/profile';
        }
        const partial = window.location.origin + pathname;
        const url = encodeURL(formatURL(partial, kwargs));
        window.navigator.clipboard.writeText(url);
    });
    const btnDeleteSketch = document.getElementById('form-delete-sketch')
    if (!btnDeleteSketch) {
        return;
    }
    btnDeleteSketch.addEventListener('submit', (e) => {
        e.preventDefault();

        $.ajax({
            url: encodeURL(formatURL(window.location.origin + '/sketch', {'sid': (getURLParameters().sid || -1)})),
            type: 'DELETE',
            data: $(e.currentTarget).serialize(),
            cache: false,
            async: true,
            success: (data) => {
                if (data.status == 200) {
                    const urlParams = getURLParameters();
                    delete urlParams.sid;
                    window.location.href = encodeURL(formatURL(window.location.href.split('?')[0], urlParams));
                } else {
                    $('<div>' + data.rendered + '</div>').find('.response-status-message').each((i, elem) => {
                        addRendered(elem);
                    })
                }
            }
        });
    })
}
