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
            defaultCords: [55.751244, 37.618423],  // Moscow coordinates
            showOnInit: true,
            autoResize: true,
        }
        for (const option of Object.keys(options)) {
            this._options[option] = options[option];
        }

        ymaps.ready(() => this._getCoordinatesByGeolocation().then((center) => this._initYmaps(center)));
    }

    _getCoordinatesByGeolocation() {
        return new Promise((resolve, reject) => {
            ymaps.geolocation.get({provider: 'yandex'}).then((res) => {
                // cords by user IP
                resolve(res.geoObjects.get(0).geometry.getCoordinates());
            }, () => {
                // if could not obtain coordinates by geolocation,
                // then use value provided by options.defaultCords
                resolve(this._options.defaultCords);
            });
        });
    }

    _initYmaps(center) {
        const ymap = new ymaps.Map(this._mapContainer, {
            center: center,
            zoom: 10,  // from 0 to 19 inclusive
            controls: [],
        }, {
            minZoom: 3,
            restrictMapArea: [[84.9, -178.9], [-73.87011, 181]],  // remove areas where map does not exist
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true,
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

        if (this._options.setPlacemarkOnclick == undefined) {
            this._options.setPlacemarkOnclick = false;
        }
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

        if (this._options.setPlacemarkOnclick) {
            this.ymap.events.add('click', (event) => {
                this.addSketchMarker(event.get('coords'));
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
                noPlacemark: true,
            },
        });
        // since we set noPlacemark: true in geolocationControl.options,
        // there's no map centring on geolocation find, so we track
        // locationchange event to center map by ourselves
        geolocationControl.events.add('locationchange', (event) => {
            const bounds = event.get('geoObjects').get(0).properties.get('boundedBy');
            const size = this.getSize();
            const state = ymaps.util.bounds.getCenterAndZoom(bounds, [size.width, size.height]);
            this.ymap.setZoom(state.zoom).then(() => this.ymap.panTo(state.center));
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

        // styles are set in imap.css
        const searchControl = new ymaps.control.SearchControl({
            options: {
                float: 'none',
                position: {
                   'left': 65,
                   'top': 15,
                },
                noPlacemark: true,
             },
        });
        searchControl.events.add('select', () => {alert('here')});

        this.ymap.controls.add(geolocationControl);
        this.ymap.controls.add(closeControl);
        this.ymap.controls.add(zoomControl);
        this.ymap.controls.add(typeSelector);
        this.ymap.controls.add(searchControl);
    }

    addSketchMarker(coordinates, image, text='Выбрать') {
        let sketchPlacemark;

        if (this._options.setPlacemarkOnclick) {
            this.ymap.geoObjects.removeAll();

            const sketchMarkerLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="balloon">' +
                    '<div class="balloon-content-wrapper">' +
                        '<span class="balloon-content">' +
                            '$[properties.balloonContent]' +
                        '<span>' +
                    '</div>' +
                '</div>',
            )

            sketchPlacemark = new ymaps.Placemark(coordinates, {
                balloonContent: 'Выбрать'
            }, {
                balloonLayout: sketchMarkerLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,
                balloonOffset: [5, 5],
            });
        } else {
            sketchPlacemark = new ymaps.Placemark(coordinates, {}, {hasBalloon: false})
        }

        this.ymap.geoObjects.add(sketchPlacemark);
        sketchPlacemark.balloon.open();
    }
}
