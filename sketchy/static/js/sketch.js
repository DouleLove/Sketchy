import {addRendered} from './base.js';
import {getURLParameters, formatURL, encodeURL} from './utils.js'

function setSketchImage() {
    const imageElement = document.getElementsByClassName('sketch-image-popup')[0];
    console.log(imageElement);

    let x = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    let imageSize;
    if (!x) {
        imageSize = "large";
    } else if (x <= 768) {
        imageSize = "small";
    } else if (x <= 1920) {
        imageSize = "medium";
    } else {
        imageSize = "large";
    }

    if (imageElement.dataset.size == imageSize) {
        return;
    }

    let imageSrc = imageElement.dataset.imname;
    let mediaSplit = imageSrc.split('media/');
    imageSrc = mediaSplit[0] + 'media/' + imageSize + '/' + mediaSplit[1];

    imageElement.setAttribute('src', imageSrc);
    imageElement.dataset.size = imageSize;
}

export function setupSketchPopUp() {
    setSketchImage();
    window.addEventListener('resize', setSketchImage);

    document.getElementById('btn-sketch-place').addEventListener('click', (e) => {
        window.location.href = encodeURL(
            window.location.origin + `/imap?coordinates=${e.currentTarget.dataset.coordinates}`,
        );
    })
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
