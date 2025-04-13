import {SketchesMap} from './sketches-map.js';
import {getURLParameters, formatURL, loadSketchPopUp} from './utils.js';


function parseCoordinates(string) {
    try {
        const split = string.split(',');
        const lon = parseFloat(split[0]);
        const lat = parseFloat(split[1]);
        if (isNaN(lon) || isNaN(lat)) {
            throw new Error('Could not parse coordinates');
        }
        return [lon, lat];
    } catch (err) {
        return null;
    }
}


function getURLCoordinates() {
    return parseCoordinates(getURLParameters().coordinates);
}


function main() {
    let zoom = 10;
    const center = getURLCoordinates();
    if (center) {
        zoom = 15;
    }

    const map = new SketchesMap(document.getElementById('map'), {
        center: center,
        zoom: zoom,
        closeable: false,
        placemarkDefaultBackgroundImage: $('meta[name="placemark-default-background-image"]')[0].content,
        placemarkDefaultForegroundImage: $('link[rel="icon"]')[0].href,
        placemarkDefaultBackgroundSize: [37, 67],
        placemarkDefaultBackgroundOffset: [-15, -50],
        placemarkDefaultForegroundSize: [35, 35],
        placemarkDefaultForegroundOffset: [-14, -41],
    });
    map.onBoundsChange = function (newBounds, oldBounds) {
        if (!this.__bounds) {
            this.__bounds = [Infinity, Infinity, -Infinity, -Infinity]
        }

        let boundsChanged = false;
        const bounds = this.__bounds.slice();
        const flattenNewBounds = newBounds.flat();
        for (let i = 0; i < bounds.length; i++) {
            if (
                (i < 2 && flattenNewBounds[i] < bounds[i])
                || (i >= 2 && flattenNewBounds[i] > bounds[i])
            ) {
                bounds[i] = flattenNewBounds[i];
                boundsChanged = true;
            }
        }

        if (!boundsChanged) {
            return;
        }

        const urlParameters = {};
        if (oldBounds) {
            const innerBoundsAsStr = `${this.__bounds[0]},${this.__bounds[1]},${this.__bounds[2]},${this.__bounds[3]}`;
            urlParameters.inner = innerBoundsAsStr;
        }
        const outerBoundsAsStr = `${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}`;
        urlParameters.outer = outerBoundsAsStr;
        this.__bounds = bounds.slice();
        const url = formatURL(window.location.origin + window.location.pathname, urlParameters);
        $.get(url).done((res) => {
            res.data.forEach((sketchData) => {
                this.addSketchMarker(
                    [sketchData.longitude, sketchData.latitude],
                    sketchData.image,
                    undefined,
                    undefined,
                    loadSketchPopUp.bind(this, sketchData.sid),
                );
            });
        });
    }.bind(map);
    map.postInit = function (postInit) {
        postInit.bind(this)();
        // trigger markers load for starting bound
        this.onBoundsChange(this.getBounds());
    }.bind(map, map.postInit)

    const sid = +(getURLParameters().sid || 0);
    if (sid) {
        loadSketchPopUp(sid);
    }
}


main();
