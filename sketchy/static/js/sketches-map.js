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
            center: null,
            zoom: 10,
            centerNoGeolocation: [55.751244, 37.618423],  // Moscow coordinates
            showOnInit: true,
            autoResize: true,
        }
        for (const option of Object.keys(options)) {
            this._options[option] = options[option];
        }

        ymaps.ready(() => {
            // if center coordinates are passed, init ymaps with those coordinates
            if (this._options.center) {
                return this._initYmaps(this._options.center);
            }
            this._getCoordinatesByGeolocation().then(
                // if successful, init ymaps with coordinates determined by user geolocation
                (center) => this._initYmaps(center),
                // if could not obtain coordinates by geolocation,
                // then use value provided by options.centerNoGeolocation
                () => this._initYmaps(this._options.centerNoGeolocation),
            );
        });
    }

    _getCoordinatesByGeolocation() {
        return new Promise((resolve, reject) => {
            ymaps.geolocation.get({provider: 'yandex'}).then((res) => {
                // cords by user IP
                resolve(res.geoObjects.get(0).geometry.getCoordinates());
            }, () => {
                reject(new Error('Could not get coordinates by user IP'));
            });
        });
    }

    _initYmaps(center) {
        const ymap = new ymaps.Map(this._mapContainer, {
            center: center,
            zoom: this._options.zoom,  // from 0 to 19 inclusive
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

    getBounds() {
        return this.ymap.getBounds();
    }
}


// dataclass - container for storing info about place: coordinates and closest address
class Place {

    constructor(coordinates, name) {
        this.coordinates = coordinates;
        this.name = name;
    }

}


export class SketchesMap extends _CleanMap {

    constructor(mapContainerElement, options={}) {
        super(mapContainerElement, options);

        if (this._options.closeable == undefined) {
            this._options.closeable = true;
        }
        if (this._options.singleMarker == undefined) {
            this._options.singleMarker = false;
        }
        if (this._options.setPlacemarkOnclick == undefined) {
            this._options.setPlacemarkOnclick = false;
        }
        if (this._options.placemarkDefaultBackgroundImage == undefined) {
            this._options.placemarkDefaultBackgroundImage = null;
        }
        if (this._options.placemarkDefaultBackgroundSize == undefined) {
            this._options.placemarkDefaultBackgroundImage = null;  // no background image, if no size specified
        }
        if (this._options.placemarkDefaultBackgroundOffset == undefined) {
            this._options.placemarkDefaultBackgroundOffset = [0, 0];
        }
        if (this._options.placemarkDefaultForegroundImage == undefined) {
            this._options.placemarkDefaultForegroundImage = null;
        }
        if (this._options.placemarkDefaultForegroundSize == undefined) {
            this._options.placemarkDefaultForegroundImage = null;  // no foreground image, if no size specified
        }
        if (this._options.placemarkDefaultForegroundOffset == undefined) {
            this._options.placemarkDefaultForegroundOffset = [0, 0];
        }
        if (this._options.placemarkBalloonDefaultText == undefined) {
            this._options.placemarkBalloonDefaultText = 'Select';
        }
        if (this._options.placemarkBalloonOffset == undefined) {
            this._options.placemarkBalloonOffset = [0, 0];
        }

        this.__balloonSelectorID = 'balloon'
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

        this.ymap.events.add('boundschange', (e) => {
            const newBounds = e.get('newBounds');
            const oldBounds = e.get('oldBounds');
            this.onBoundsChange(newBounds, oldBounds);
        });

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
        this.ymap.controls.add(zoomControl);
        this.ymap.controls.add(typeSelector);
        this.ymap.controls.add(searchControl);
        if (this._options.closeable) {
            this.ymap.controls.add(closeControl);
        }
    }

    _isSingleMarkerMode() {
        return this._options.singleMarker;
    }

    // only compatible with options.singleMarker = true
    _moveMarker(coordinates) {
        for (let i = 0; i < this.ymap.geoObjects.getLength(); i++) {
            this.ymap.geoObjects.get(i).geometry.setCoordinates(coordinates);
        }
    }

    _switchBalloon(placemark, balloon) {
        if (!balloon) {
            balloon = placemark.balloon;
        }

        if (balloon.isOpen()) {
            balloon.close();
        } else {
            balloon.open().then(() => {
                const balloonElement = document.getElementById(this.__balloonSelectorID);
                balloonElement.addEventListener('click', () => {
                    const coordinates = placemark.geometry.getCoordinates();
                    this._reverseGeocode(coordinates).then(
                        (name) => {
                            return this.onSelect(new Place(coordinates, name));
                        },
                        () => {
                            return this.onSelect(new Place(coordinates));  // place with missing address
                        },
                    )
                });
            })
        }
    }

    _buildBackgroundPlacemark(
        coordinates,
        placemarkBackgroundImage,
        imageSize,
        imageOffset,
        balloonText,
    ) {
        if (placemarkBackgroundImage == undefined) {
            placemarkBackgroundImage = this._options.placemarkDefaultBackgroundImage;
        }

        if (placemarkBackgroundImage == null) {
            return;
        }

        let placemarkData = {};
        let placemarkOptions = {};

        if (this._options.setPlacemarkOnclick) {
            const sketchMarkerLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="balloon" id="{{ properties.balloonSelectorID }}">' +
                    '<div class="balloon-content-wrapper">' +
                        '<span class="balloon-content">' +
                            '{{ properties.balloonContent }}' +
                        '<span>' +
                    '</div>' +
                '</div>',
            )

            if (balloonText == undefined) {
                balloonText = this._options.placemarkBalloonDefaultText;
            }
            placemarkData = {
                balloonSelectorID: this.__balloonSelectorID,
                balloonContent: balloonText != undefined ? balloonText : '',
            }

            placemarkOptions = {
                balloonLayout: sketchMarkerLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,
                balloonOffset: this._options.placemarkBalloonOffset,
            }
        } else {
            placemarkOptions = {
                hasBalloon: false,
            }
        }

        if (imageSize == undefined) {
            imageSize = this._options.placemarkDefaultBackgroundSize;
        }

        if (imageOffset == undefined) {
            imageOffset = this._options.placemarkDefaultBackgroundOffset;
        }

        if (placemarkBackgroundImage != null) {
            placemarkOptions.iconLayout = 'default#image';
            placemarkOptions.iconImageHref = placemarkBackgroundImage;
            placemarkOptions.iconImageSize = imageSize;
            placemarkOptions.iconImageOffset = imageOffset;
        }

        return new ymaps.Placemark(coordinates, placemarkData, placemarkOptions);
    }

    _buildForegroundPlacemark(
        coordinates,
        placemarkForegroundImage,
        imageSize,
        imageOffset,
    ) {
        if (placemarkForegroundImage == undefined) {
            placemarkForegroundImage = this._options.placemarkDefaultForegroundImage;
        }

        if (placemarkForegroundImage == null) {
            return;
        }

        const circleLayout = ymaps.templateLayoutFactory.createClass(
            '<img class="placemark-foreground{{ properties.defaultClass }}" src="{{ properties.iconImageHref }}"' +
                 'style="border-radius: 50%;' +
                        'object-fit: cover;' +
                        'border: 1px solid rgba(98, 104, 115, .8);' +
                        'width: {{ properties.iconImageSize[0] }}px;' +
                        'height: {{ properties.iconImageSize[1] }}px; ' +
                        'position: relative;' +
                        'left: {{ properties.iconImageOffset[0] }}px;' +
                        'top: {{ properties.iconImageOffset[1] }}px;" />',
        );

        if (imageSize == undefined) {
            imageSize = this._options.placemarkDefaultForegroundSize;
        }

        if (imageOffset == undefined) {
            imageOffset = this._options.placemarkDefaultForegroundOffset;
        }

        const placemarkForeground = new ymaps.Placemark(coordinates, {
            iconImageHref: placemarkForegroundImage,
            iconImageSize: imageSize,
            iconImageOffset: imageOffset,
            defaultClass: placemarkForegroundImage == this._options.placemarkDefaultForegroundImage ? ' default' : '',
        }, {
            hasBalloon: false,
            iconLayout: circleLayout,
            zIndex: 50000,
            zIndexHover: 50000,
            iconShape: {
                type: 'Circle',
                coordinates: [Math.floor(imageSize[0] / 2), Math.floor(imageSize[1] / 2)],
                radius: Math.floor(imageSize[0] / 2),
            },
        });

        return placemarkForeground;
    }

    _reverseGeocode(coordinates) {
        return new Promise((resolve, reject) => {
            const cordsString = `${coordinates[0]},${coordinates[1]}`;
            const geocodeOptions = {results: 1};
            ymaps.geocode(cordsString, geocodeOptions).then(
                function (res) {
                    const geoObject = res.geoObjects.get(0);
                    if (!geoObject) {
                        reject(new Error('No geo-objects found by given coordinates'))
                    }
                    resolve(geoObject.properties.get('name'));
                },
                function (err) {
                    reject(err);
                }
            )
        })
    }

    addSketchMarker(coordinates, placemarkForegroundImage, placemarkBackgroundImage, balloonText, placemarkOnClick) {
        // if placemark was already created once, and we are in mode where user can have
        // only one placemark (_isSingleMarkerMode()), then just move out single placemark
        if (this._isSingleMarkerMode() && this.ymap.geoObjects.getLength() > 0) {
            this._moveMarker(coordinates);
            return;
        }

        const backgroundPlacemark = this._buildBackgroundPlacemark(coordinates, placemarkBackgroundImage, balloonText);
        if (backgroundPlacemark) {
            this.ymap.geoObjects.add(backgroundPlacemark);
        }

        const foregroundPlacemark = this._buildForegroundPlacemark(coordinates, placemarkForegroundImage);
        if (foregroundPlacemark) {
            this.ymap.geoObjects.add(foregroundPlacemark);
        }

        [backgroundPlacemark, foregroundPlacemark].forEach((placemark) => {
            placemark.events.add('click', function (event) {
                event.preventDefault();
                this._switchBalloon(backgroundPlacemark);
                if (placemarkOnClick) {
                    placemarkOnClick(backgroundPlacemark);
                }
            }.bind(this));
        })

        if (backgroundPlacemark.balloon) {
            this._switchBalloon(backgroundPlacemark);
        }
    }

    onSelect(place) {}  // abstract method

    onBoundsChange(newBounds, oldBounds) {}  // abstract method
}
