/**
 * @param {number} tm
 * @returns {string}
 */
const fmtUNIXTime = (tm) => {
  const date = new Date(tm * 1000);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

export {
  // eslint-disable-next-line import/prefer-default-export
  fmtUNIXTime,
};
