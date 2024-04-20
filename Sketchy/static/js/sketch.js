import {addRendered} from './base.js';
import {getURLParameters, formatURL, encodeURL} from './utils.js'


export function setupSketchPopUp() {
    document.getElementById('btn-sketch-place').addEventListener('click', (e) => {
        window.location.href = encodeURL(
            window.location.origin + `?hook=place&place=${e.currentTarget.children[1].innerHTML}`
        );
    })
    document.getElementById('form-delete-sketch').addEventListener('submit', (e) => {
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
