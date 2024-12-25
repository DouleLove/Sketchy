import {getURLParameters, encodeURL, formatURL} from './utils.js';


class _Loader {

    constructor(limit=0, offset=0, kwds) {
        this.limit = limit;
        this.offset = offset;
        this._kwds = kwds;
        this._active = true;
    }

    get active() {
        return this._active;
    }

    _doRequest() {
        const urlParams = getURLParameters();

        urlParams.limit = this.limit;
        urlParams.offset = this.offset;
        for (let key in this._kwds) {
            urlParams[key] = this._kwds[key];
        }

        const reqURL = encodeURL(formatURL(window.location.href.split('?')[0], urlParams));

        return Promise.resolve($.get(reqURL));
    }

    request() {
        if (!this._active) {
            return;
        }
        const response = this._doRequest();
        this.offset += this.limit;
        return response.then((data) => {if (data.data.results_left || 0 == 0) { this._active = false }; return data;});
    }
}


export class SearchLoader extends _Loader {

    constructor(limit=0, offset=0, rule='any', query='') {
        super(limit, offset, {'rule': rule});
    }

    get rule() {
        return this._kwds.rule;
    }

    set rule(value) {
        this._kwds.rule = value;
    }

    get query() {
        return this._kwds.query
    }

    set query(value) {
        this._kwds.query = value;
    }
}


export class ViewLoader extends _Loader {

    constructor(limit=0, offset=0, view='sketches') {
        super(limit, offset, {'view': view});
    }

    get view() {
        return this._kwds.view;
    }

    set view(value) {
        this._kwds.view = value;
    }
}
