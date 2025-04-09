class _CleanMap {

    constructor(mapContainerElement, options={}) {
        if (!mapContainerElement) {
            mapContainerElement = document.getElementById('map')
        }

        if (!mapContainerElement) {
            throw new ReferenceError('Could not get container for map');
        }

        const mapContainerBoundingRect = mapContainerElement.getBoundingClientRect();

        this._mapContainer = mapContainerElement;
        this._mapPos = {'x': mapContainerBoundingRect.x, 'y': mapContainerBoundingRect.y};
        this._mapSize = {'width': mapContainerBoundingRect.width, 'height': mapContainerBoundingRect.height};

        this._options = {
            defaultCords: [55.751244, 37.618423],
            showOnInit: true,
            autoResize: true,
        }
        for (const option of Object.keys(options)) {
            if (!this._options.hasOwnProperty(option)) {
                throw new ReferenceError('Unknown option "' + option + '"');
            }
            this._options[option] = options[option];
        }

        ymaps.ready(() => this._initYmaps());
    }

    _initYmaps() {
        // cords by user IP
        let cords = [ymaps.geolocation.latitude, ymaps.geolocation.longitude];
        // if could not obtain any of longitude, latitude by user IP,
        // then use the default coordinates which are the center of Moscow
        if (cords[0] == undefined || cords[1] == undefined) {
            cords = this._options.defaultCords;
        }

        const ymap = new ymaps.Map(this._mapContainer, {
            center: cords,
            zoom: 10,  // from 0 to 19 inclusive
            controls: [],
        }, {
            minZoom: 3,
            restrictMapArea: [[84.9, -178.9], [-73.87011, 181]],  // remove areas where map does not exist
            suppressMapOpenBlock: true,
        });

        this.ymap = ymap;

        if (!this._options.showOnInit) {
            this.hide();
        }
        if (this._options.autoResize) {
            window.addEventListener('resize', () => {
                const containerRect = this._mapContainer.getBoundingClientRect();
                this.resize(containerRect.width, containerRect.height);
            });
        }

        this._wasShownOnce = false;
        if (this._options.showOnInit) {
            this.postInit();
            this._wasShownOnce = true;
        }
    }

    // abstract method, actually gets called before first show, not the init,
    // because some functionality is not available directly after ymaps init
    postInit() {return;}

    getPos() {
        return this._mapPos;
    }

    getSize() {
        return this._mapSize;
    }

    move(x, y) {
        if (x != undefined) {
            this._mapPos.x = x;
        }
        if (y != undefined) {
            this._mapPos.y = y;
        }

        this._mapContainer.style.position = 'relative';
        this._mapContainer.style.left = this._mapPos.x + 'px';
        this._mapContainer.style.top = this._mapPos.y + 'px';
    }

    resize(width, height) {
        if (width != undefined) {
            this._mapSize.width = width;
        }
        if (height != undefined) {
            this._mapSize.height = height;
        }

        this._mapContainer.style.width = this._mapSize.width + 'px';
        this._mapContainer.style.height = this._mapSize.height + 'px';

        this.ymap.container.fitToViewport();
    }

    isVisible() {
        const size = this.ymap.container.getSize()
        return size[0] != 0 && size[1] != 0;
    }

    show() {
        if (!this._wasShownOnce) {
            this.postInit();
            this._wasShownOnce = true;
        }
        this.resize(this._mapSize.width, this._mapSize.height);
    }

    hide() {
        const size = structuredClone(this._mapSize);
        this.resize(0, 0);
        this._mapSize = size;
    }

    toggle() {
        this.isVisible() ? this.hide() : this.show();
    }
}


export class SketchesMap extends _CleanMap {

    constructor(mapContainerElement, options={}) {
        super(mapContainerElement, options);
    }

    postInit() {
        this._setupControls();

        if (this._options.autoResize) {
            window.addEventListener('resize', () => {
                let ww  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let wh = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
                this._mapSize.width = ww;
                this._mapSize.height = wh - document.getElementById('nav-wrapper').getBoundingClientRect().height;
                if (this.isVisible()) {
                    this.resize();
                }
            });
        }
    }

    _setupControls() {
        const closeControl = new ymaps.control.Button({
            data: {
                iconType: 'cross',
                title: '',
            },
            options: {
                layout: 'round#buttonLayout',
                maxWidth: 145,
                selectOnClick: false,
                float: 'none',
                position: {
                    top: 10,
                    right: 10,
                },
            },
        });

        closeControl.events.add('click', () => {
            document.getElementById('background-container').style.opacity = 1;
            this.hide();
        });

        const geolocationControl = new ymaps.control.GeolocationControl({
            data: {
                title: '',
            },
            options: {
                layout: 'round#buttonLayout',
            },
        });

        // rotate this control with css because it is vertical by default
        const zoomControl = new ymaps.control.ZoomControl({
            data: {
                title: '',
            },
            options: {
                layout: 'round#zoomLayout',
            },
        });

        const typeSelector = new ymaps.control.TypeSelector({
            options: {
                layout: 'round#listBoxLayout',
                itemLayout: 'round#listBoxItemLayout',
                itemSelectableLayout: 'round#listBoxItemSelectableLayout',
                float: 'none',
                position: {
                    'bottom': 10,
                    'left': 10,
                },
            },
        });

        const searchControl = new ymaps.control.SearchControl({
            options: {
                 float: 'none',
                 position: {
                    'left': 65,
                    'top': 15,
                 },
                 provider: 'yandex#search',
                 maxWidth: 10,
                 fitMaxWidth: true,
             },
        });

        this.ymap.controls.add(geolocationControl);
        this.ymap.controls.add(closeControl);
        this.ymap.controls.add(zoomControl);
        this.ymap.controls.add(typeSelector);
        this.ymap.controls.add(searchControl);
    }

    addSketchMarker(latitude, longitude) {
        console.log(latitude, longitude);
    }
}
