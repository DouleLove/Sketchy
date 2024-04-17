import {getURLParameters, encodeURL, formatURL} from './utils.js';


export class ViewLoader {

    constructor(limit=0, offset=0, view='sketches') {
        this.limit = limit || 0;
        this.offset = offset || 0;
        this.view = view;
        this._active = true;
    }

    is_active() {
        return this._active;
    }

    _doRequest() {
        const urlParams = getURLParameters();
        urlParams.view = this.view;  // dont ignore the same view since new entries may appear
        urlParams.offset = this.offset;
        urlParams.limit = this.limit;
        const reqURL = encodeURL(formatURL(window.location.href.split('?')[0], urlParams));

        return Promise.resolve($.get(reqURL));
    }

    request() {
        if (!this._active) {
            return;
        }
        const response = this._doRequest();
        this.offset += this.limit;
        response.then((data) => {if ((data.data.results_left || 0) == 0) { this._active = false; }})
        return response;
    }
}
