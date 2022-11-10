const { rgb } = require("pdf-lib");

const hexCharacters = "a-f\\d";
const match3or4Hex = `#?[${hexCharacters}]{3}[${hexCharacters}]?`;
const match6or8Hex = `#?[${hexCharacters}]{6}([${hexCharacters}]{2})?`;
const nonHexChars = new RegExp(`[^#${hexCharacters}]`, "gi");
const validHexSize = new RegExp(`^${match3or4Hex}$|^${match6or8Hex}$`, "i");

const MAX_COLOR_VALUE = 255;

/*
  based on: 
  https://github.com/sindresorhus/hex-rgb/blob/8962ac2193bb6e482d56bfe081ade7a4dc1103a2/index.js
*/
const hex2rgb = (hexString) => {
  if (nonHexChars.test(hexString) || !validHexSize.test(hexString)) {
    throw new TypeError("Expected a valid hex string");
  }

  hexString = hexString.replace(/^#/, "");
  let alphaFromHex = 1;

  if (hexString.length === 8) {
    alphaFromHex = Number.parseInt(hexString.slice(6, 8), 16) / MAX_COLOR_VALUE;
    hexString = hexString.slice(0, 6);
  }

  if (hexString.length === 4) {
    alphaFromHex =
      Number.parseInt(hexString.slice(3, 4).repeat(2), 16) / MAX_COLOR_VALUE;
    hexString = hexString.slice(0, 3);
  }

  if (hexString.length === 3) {
    hexString =
      hexString[0] +
      hexString[0] +
      hexString[1] +
      hexString[1] +
      hexString[2] +
      hexString[2];
  }

  const number = Number.parseInt(hexString, 16);
  const red = number >> 16;
  const green = (number >> 8) & MAX_COLOR_VALUE;
  const blue = number & MAX_COLOR_VALUE;

  const alpha = alphaFromHex;

  return { red, green, blue, alpha };
};

/**
  transforms a rgb color (channel value between 0 and 255) into a
  pdf rgb color (channel value between 0 and 1)
*/
const pdfRGB = (red, green, blue) =>
  rgb(red / MAX_COLOR_VALUE, green / MAX_COLOR_VALUE, blue / MAX_COLOR_VALUE);

const hex2pdfRGB = (hexString) => {
  const { red, green, blue } = hex2rgb(hexString);
  return pdfRGB(red, green, blue);
};

/*
  colors names and its values
  https://www.colorhexa.com/color-names
*/
const COLOR = {
  BLACK: rgb(0, 0, 0),
  WHITE: rgb(1, 1, 1),
  AIR_FORCE_BLUE: pdfRGB(93, 138, 168),
  GAINSBORO: pdfRGB(220, 220, 220),
  GHOST_WHITE: pdfRGB(248, 248, 255),
  NAVAJO_WHITE: pdfRGB(255, 222, 173),
};

module.exports = {
  hex2rgb,
  hex2pdfRGB,
  COLOR,
};
