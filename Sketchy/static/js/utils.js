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
    elem.animate(keyframes, {'duration': duration});
}
