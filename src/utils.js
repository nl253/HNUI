/**
 * @param {string} txt
 * @return {number}
 */
const getTimeToReadInMin = txt => Math.ceil(txt.length / 650);

export {
  getTimeToReadInMin,
};
