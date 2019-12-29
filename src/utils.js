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
};
