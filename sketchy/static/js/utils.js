import {loadPopUp} from './base.js';
import {setupSketchPopUp} from './sketch.js';


export function encodeURL(url) {
    const parameters = getURLParameters(url == undefined ? window.location.href : url);
    for (let param in parameters) {
        parameters[param] = encodeURIComponent(parameters[param]);
    }

    return formatURL((url == undefined ? window.location.href : url).split('?')[0], parameters)
}


export function decodeURL(url) {
    return decodeURIComponent(url == undefined ? window.location.href : url);
}


export function getURLParameters(url) {
    const parameters = {};
    const searchString = decodeURL((url == undefined ? window.location.href : url).split('?')[1] || '');
    const pairs = searchString.split("&");
    if (pairs.length < 2 && !pairs[0]) {
        return {};
    }
    let parts;
    for (let i = 0; i < pairs.length; i++) {
        parts = pairs[i].split("=");
        const [name, data] = parts;
        parameters[name] = data;
    }

    return parameters;
}


export function formatURL(partial, parameters) {
    let joinedParams =  ''
    for (const key in parameters) {
        if (!joinedParams) {
            joinedParams += `?${key}=${parameters[key]}`;
        } else {
            joinedParams += `&${key}=${parameters[key]}`;
        }
    }
    if (!(typeof partial === 'string' || partial instanceof String)) {
        partial = Array.from(partial).join('');
    }
    return partial + joinedParams;
}


export function getBrightness(elem) {
    let styleBrightness = getComputedStyle(elem).getPropertyValue('filter');
    return +(styleBrightness.replace(/[a-zA-Z()]+/g, ''));
}


export function clearAnimations(elem) {
    elem.getAnimations().forEach((animation) => animation.cancel());
}


export function animateBrightness(elem, from=undefined, to=undefined, duration=300) {
    if (from === undefined) {
        from = getBrightness(elem);
    }
    if (to === undefined) {
        to = from === 1 ? 0 : 1;
    }

    clearAnimations(elem);

    elem.animate(
        [
            {
                filter: `brightness(${from * 100}%)`
            },
            {
                filter: `brightness(${to * 100}%)`
            }
        ],
        {
            'duration': duration,
            'iterations': 1,
            'fill': 'forwards'
        }
    );
}


export function animateOpacity(elem, values, duration=1000) {
    const keyframes = [];

    for (const key in values) {
        const frame = {'offset': +key, 'opacity': values[key]};
        keyframes.push(frame);
    }

    keyframes.sort((a, b) => a['offset'] - b['offset']);
    elem.animate(keyframes, {'duration': duration, 'iterations': 1, 'fill': 'forwards'});
    elem.style.opacity = keyframes.pop().opacity;
}


export function loadSketchPopUp(sid) {
    sid = sid ? sid : getURLParameters().sid;

    const params = {}
    if (sid) {
        params.sid = sid;
    }

    loadPopUp(window.location.origin + '/sketch', params, setupSketchPopUp);
}
