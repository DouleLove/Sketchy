class _Loader {

    constructor(uid, limit, offset, rule) {
        this.uid = uid;
        this.limit = limit || 0;
        this.offset = offset || 0;
        this.rule = rule;
        this._active = true;
    }

    _doRequest() {

    }

    load() {
        if (!this._active) {
            return;
        }
        return this._doRequest();
    }
}


function getLoader(uid=null, limit=30, offset=0, rule='any') {
    return new _Loader(uid, limit, offset, rule)
}


loader = getLoader(1);
console.log(loader.limit);
