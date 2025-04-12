import {SketchesMap} from './sketches-map.js'

function main() {
    const map = new SketchesMap(document.getElementById('map'), {
        allowClose: false,
        placemarkDefaultBackgroundImage: $('meta[name="placemark-default-background-image"]')[0].content,
        placemarkDefaultForegroundImage: $('link[rel="icon"]')[0].href,
        placemarkDefaultBackgroundSize: [37, 67],
        placemarkDefaultBackgroundOffset: [-15, -50],
        placemarkDefaultForegroundSize: [35, 35],
        placemarkDefaultForegroundOffset: [-14, -41],
    });
}

main();
