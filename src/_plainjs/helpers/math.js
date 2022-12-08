const roundUp = (value, precision = 0) => {
  if (precision > 0) {
    precision = Math.pow(10, precision);
    return Math.ceil(value * precision) / precision;
  }
  return Math.ceil(value);
};

const roundDown = (value, precision = 0) => {
  if (precision > 0) {
    precision = Math.pow(10, precision);
    return Math.floor(value * precision) / precision;
  }
  return Math.floor(value);
};

module.exports = {
  roundUp,
  roundDown,
};
