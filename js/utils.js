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
