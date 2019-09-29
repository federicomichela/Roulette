/**
 * getRandomNumber - Returns a random float number within min and max-1
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * getRandomInt - Returns a random int number within min and max-1
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
function getRandomInt(min, max) {
    return Math.floor(getRandomNumber(min, max));
}

/**
 * Generate map for the symbols to allocate on the wheel.
 * Places 0 at the beginning and 00 half way through.
 */
function generateWheelMap() {
    let map = [];

    for (let i=0; i < SEGMENTS_NUM - 1; i++) {
        map.push(i.toString());
    }

    map.splice([Math.floor(SEGMENTS_NUM/2)], 0, "00");

    return map;
}

/**
 * getCurrentRotation - Returns the rotation of an element in the DOM
 * in degrees.
 * (CREDITS: https://stackoverflow.com/questions/19574171/how-to-get-css-transform-rotation-value-in-degrees-with-javascript)
 *
 * @param {DOM element} element
 *
 * @returns {Number}
 */
function getCurrentRotation(element) {
    let style = window.getComputedStyle(element, null);
    let transformValue = style.getPropertyValue("-webkit-transform") ||
                        style.getPropertyValue("-moz-transform") ||
                        style.getPropertyValue("-ms-transform") ||
                        style.getPropertyValue("-o-transform") ||
                        style.getPropertyValue("transform") ||
                        "none";
    let rotation = 0;

    if (transformValue != "none") {
        let values = transformValue.split('(')[1].split(')')[0].split(',');
        let angle = Math.round(Math.atan2(values[1],values[0]) * (180/Math.PI));

        //adding 360 degrees here when angle < 0 is equivalent to adding (2 * Math.PI) radians before
        rotation = (angle < 0 ? angle + 360 : angle);
    }

    return rotation;
}

/**
 * Counts up from a value to a target.
 *
 * @param {DOMElement} targetElement
 * @param {Number} start
 * @param {Number} end
 * @param {Number} duration
 *
 * @returns {type} Description
 */
function countUp(targetElement, start, end, duration) {
    duration = duration || 0;

    let range = end - start;
    let current = start;
    let increment = end > start? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));
    let timer = setInterval(function() {
        current += increment;
        targetElement.innerText = current.formatCurrency();
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}


/**
 * Prefixes the current number value with a currency symbol
 * e.g £1000
 *
 * @param {String} locale
 * @param {String} currency
 *
 * @returns {String}
 */
Number.prototype.formatCurrency = function(locale, currency) {
    locale = locale || "en_EN";
    currenty = currency || "GBP";

    return this.toLocaleString('en-EN', { style: 'currency', currency: 'GBP' });
}
