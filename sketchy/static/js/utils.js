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


export function shortenText(textContainer, text=null) {

    function _getText() {
        if (text != null) {
            return text;
        }
        if (textContainer.value != undefined) {
            return textContainer.value;
        }
        if (!textContainer.children) {
            return textContainer.innerHTML;
        }
        throw new Error('Cannot get text for `${textContainer}`');
    }

    function _getFont() {

        function getStyle(element, prop) {
            return window.getComputedStyle(element, null).getPropertyValue(prop);
        }

        const fontWeight = getStyle(textContainer, 'font-weight') || 'normal';
        const fontSize = getStyle(textContainer, 'font-size') || '16px';
        const fontFamily = getStyle(textContainer, 'font-family') || 'Times New Roman';

        return `${fontWeight} ${fontSize} ${fontFamily}`;
    }

    text = _getText();
    const font = _getFont();

    // reuse canvas
    const canvas = shortenText.canvas || (shortenText.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    const charWidth = metrics.width / text.length;

    const maxCharsNum = Math.floor(textContainer.offsetWidth / charWidth) - 4;  // 3 chars for dots and 1 extra char

    if (text.length > maxCharsNum) {
        return text.slice(0, maxCharsNum) + '...';
    }

    return text
}
