/**
 * @param {string} txt
 * @return {number}
 */
const getTimeToReadInMin = txt => Math.ceil(txt.length / 650);

/**
 * @param {number} tm
 * @return {string}
 */
const fmtUNIXTime = tm => {
  const date = new Date(tm * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export {
  fmtUNIXTime,
  getTimeToReadInMin,
};
