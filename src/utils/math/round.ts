export const roundUp = (value: number, precision = 0) => {
  if (precision > 0) {
    precision = Math.pow(10, precision);
    return Math.ceil(value * precision) / precision;
  }
  return Math.ceil(value);
};

export const roundDown = (value: number, precision = 0) => {
  if (precision > 0) {
    precision = Math.pow(10, precision);
    return Math.floor(value * precision) / precision;
  }
  return Math.floor(value);
};
