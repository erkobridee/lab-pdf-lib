const { StandardFonts, rgb, toRadians } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const { isNumber, isObject } = require("./is");
const { FONT_NAME, loadFontFile } = require("./fs");
const { roundUp } = require("./math");

//----------------------------------------------------------------------------//

const FONT_SIZE_TEXT = 20;
const FONT_SIZE_INFO = 8;
const FONT_SIZE_HASH = 7;

const loadPdfFonts = async (pdfDoc, options = {}) => {
  const {
    textFontName = FONT_NAME.PATRICK_HAND,
    fontSizeText = FONT_SIZE_TEXT,
    fontSizeInfo = FONT_SIZE_INFO,
    fontSizeHash = FONT_SIZE_HASH,
  } = options;

  const fontBuffer = loadFontFile(textFontName);

  let fontText;
  if (fontBuffer) {
    pdfDoc.registerFontkit(fontkit);
    fontText = await pdfDoc.embedFont(fontBuffer);
  } else {
    fontText = await pdfDoc.embedFont(StandardFonts.CourierOblique);
  }
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const textHeightAtDesiredFontSize = roundUp(
    fontText.heightAtSize(fontSizeText)
  );
  const infoHeightAtDesiredFontSize = roundUp(
    fontHelvetica.heightAtSize(fontSizeInfo)
  );
  const hashHeightAtDesiredFontSize = roundUp(
    fontHelvetica.heightAtSize(fontSizeHash)
  );

  return {
    fontText,
    fontInfo: fontHelvetica,
    fontHash: fontHelvetica,

    fontSizeText,
    fontSizeInfo,
    fontSizeHash,

    textHeightAtDesiredFontSize,
    infoHeightAtDesiredFontSize,
    hashHeightAtDesiredFontSize,
  };
};

//----------------------------------------------------------------------------//

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
  FAFAFA: pdfRGB(250, 250, 250),
  RED: pdfRGB(255, 0, 0),
  GREEN: pdfRGB(0, 255, 0),
  BLUE: pdfRGB(0, 0, 255),
  AIR_FORCE_BLUE: pdfRGB(93, 138, 168),
  GAINSBORO: pdfRGB(220, 220, 220),
  MUNSELL: pdfRGB(242, 243, 244),
  PASTEL_BLUE: pdfRGB(174, 198, 207),
  PASTEL_GRAY: pdfRGB(207, 207, 196),
  PAYNE_GREY: pdfRGB(83, 103, 120),
  SLATE_GRAY: pdfRGB(112, 128, 144),
  SILVER: pdfRGB(192, 192, 192),
  SNOW: pdfRGB(255, 250, 250),
  FLORAL_WHITE: pdfRGB(255, 250, 240),
  GHOST_WHITE: pdfRGB(248, 248, 255),
  NAVAJO_WHITE: pdfRGB(255, 222, 173),
  WHITE_SMOKE: pdfRGB(245, 245, 245),
  LIGHT_BROWN: pdfRGB(181, 101, 29),
};

//----------------------------------------------------------------------------//

/**
 * kevinswartz matrix calculation
 * https://github.com/Hopding/pdf-lib/issues/65#issuecomment-468064410
 *
 * the height attribute on the parameter it's the rectangle height or it could be the font-size value
 *
 * returns { x: number, y: number }
 */
const getPDFCompensateRotation = ({
  x,
  y,
  height,
  scale = 1,
  onWidth,
  onHeight,
  rotation = { type: "degrees", angle: 0 },
}) => {
  const rotationRads = toRadians(rotation);
  const { angle } = rotation;

  const coordsFromBottomLeft = {
    x: x / scale,
    y: [90, 270].includes(angle)
      ? onWidth - (y + height) / scale
      : onHeight - (y + height) / scale,
  };

  switch (angle) {
    case 90:
      return {
        x:
          coordsFromBottomLeft.x * Math.cos(rotationRads) -
          coordsFromBottomLeft.y * Math.sin(rotationRads) +
          onWidth,
        y:
          coordsFromBottomLeft.x * Math.sin(rotationRads) +
          coordsFromBottomLeft.y * Math.cos(rotationRads),
      };
    case 180:
      return {
        x:
          coordsFromBottomLeft.x * Math.cos(rotationRads) -
          coordsFromBottomLeft.y * Math.sin(rotationRads) +
          onWidth,
        y:
          coordsFromBottomLeft.x * Math.sin(rotationRads) +
          coordsFromBottomLeft.y * Math.cos(rotationRads) +
          onHeight,
      };
    case 270:
      return {
        x:
          coordsFromBottomLeft.x * Math.cos(rotationRads) -
          coordsFromBottomLeft.y * Math.sin(rotationRads),
        y:
          coordsFromBottomLeft.x * Math.sin(rotationRads) +
          coordsFromBottomLeft.y * Math.cos(rotationRads) +
          onHeight,
      };
    default:
      return { x: coordsFromBottomLeft.x, y: coordsFromBottomLeft.y };
  }
};

/**
 * from a given number or partial distances object, gets the object of Distances
 *
 * interface Distances {
 *  top: number;
 *  bottom: number;
 *  left: number;
 *  right: number;
 * }
 *
 * @param {number | Partial<Distances>} value
 * @param {number} scale
 *
 * @returns Distances
 */
const getTopBottomLeftRightValues = (value = 0, scale = 1) => {
  if (isNumber(value) && value > 0) {
    value = value * scale;
    return { top: value, bottom: value, left: value, right: value };
  }

  if (isObject(value)) {
    const { top = 0, bottom = 0, left = 0, right = 0 } = value;
    return {
      top: top * scale,
      bottom: bottom * scale,
      left: left * scale,
      right: right * scale,
    };
  }

  return { top: 0, bottom: 0, left: 0, right: 0 };
};

const getPDFCoordsLimits = ({ rectangle, paddings = 0, scale = 1 }) => {
  const {
    top: rectanglePaddingTop,
    bottom: rectanglePaddingBottom,
    left: rectanglePaddingLeft,
    right: rectanglePaddingRight,
  } = getTopBottomLeftRightValues(paddings, scale);

  const {
    x: rectangleX,
    y: rectangleY,
    width: rectangleWidth,
    height: rectangleHeight,
  } = rectangle;

  const yTop = rectangleY + rectangleHeight - rectanglePaddingTop;
  const yBottom = rectangleY + rectanglePaddingBottom;

  const xRight = rectangleX + rectangleWidth - rectanglePaddingRight;
  const xLeft = rectangleX + rectanglePaddingLeft;

  return { yTop, yBottom, xLeft, xRight };
};

/**
 * get the pdf coords from pdf page
 *
 * pdf positioning system: x: 0 = left and y: 0 = bottom, from x: 0 = left and y: 0 = top
 */
const getPDFCoordsFromPage = ({
  x,
  y,
  width,
  height,
  margins = 0,
  scale = 1,
  pdfPage,
}) => {
  const rotation = pdfPage.getRotation();

  const { width: pageWidth, height: pageHeight } = pdfPage.getSize();

  const { top, bottom, left, right } = getTopBottomLeftRightValues(
    margins,
    scale
  );

  x = (x ?? 0) + left;
  y = (y ?? 0) + top;

  width = (width ?? pageWidth) * scale - (left + right);
  height = (height ?? pageHeight) * scale - (top + bottom);

  const correction = getPDFCompensateRotation({
    x,
    y,
    height,
    scale,
    onWidth: pageWidth,
    onHeight: pageHeight,
    rotation,
  });

  return {
    x: correction.x,
    y: correction.y,
    width,
    height,
  };
};

/**
 * keep in mind that the pdf positioning orientation start at left (x: 0) and bottom (y: 0)
 *
 * the parameters consider the positioning orientation from left (x: 0) and top (y: 0)
 */
const getPDFCoordsInsideRectangle = ({
  x,
  y,
  width = 10,
  height = 10,
  top,
  bottom,
  left,
  right,
  scale = 1,
  rectangle,
  rectanglePaddings = 0,
  keepInside = false,
  rotateWith = true,
}) => {
  const requiredRectangleAttributes = ["x", "y", "width", "height"];
  if (isObject(rectangle)) {
    const missingRectangleAttributes = requiredRectangleAttributes.reduce(
      (acc, property) => {
        if (!rectangle.hasOwnProperty(property)) {
          acc.push(property);
        }
        return acc;
      },
      []
    );

    if (missingRectangleAttributes.length > 0) {
      throw new Error(
        `missing attributes { ${missingRectangleAttributes.join(
          ", "
        )} } on the Rectangle object`
      );
    }
  } else {
    throw Error(
      `the rectangle attribute must be an object that defines { ${requiredRectangleAttributes.join(
        ", "
      )} }`
    );
  }

  //---===---//

  if (!rotateWith && keepInside) {
    rotateWith = true;
  }

  const { rotate: rectangleRotate } = rectangle;

  const { yTop, yBottom, xLeft, xRight } = getPDFCoordsLimits({
    rectangle,
    paddings: rectanglePaddings,
    scale,
  });

  //---===---//

  let newWidth = width * scale;
  let newHeight = height * scale;

  let newX = xLeft + (x ?? 0);
  let newY = yTop - (height + (y ?? 0));

  if (isNumber(left) || isNumber(right)) {
    if (isNumber(left)) {
      newX = xLeft + left;
    }

    if ((isNumber(left) || isNumber(x)) && isNumber(right)) {
      newWidth = xRight - newX - right;
    } else if (isNumber(right)) {
      newX = xRight - (newWidth + right);
    }
  }

  if (isNumber(top) || isNumber(bottom)) {
    if (isNumber(bottom)) {
      newY = yBottom + bottom;
    }

    if ((isNumber(bottom) || isNumber(y)) && isNumber(top)) {
      newHeight = yTop - newY - top;
    } else if (isNumber(top)) {
      newY = yTop - (newHeight + top);
    }
  }

  if (keepInside) {
    const xWidth = newX + newWidth;
    if (xWidth > xRight) {
      newWidth = newWidth - (xRight - xWidth);
    }

    const yHeight = newY + newHeight;
    if (yHeight > yTop) {
      newHeight = newHeight - (yTop - yHeight);
    }
  }

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
    rotate: rotateWith ? rectangleRotate : undefined,
  };
};

//----------------------------------------------------------------------------//

const getLastPdfPage = (pdfDoc) => pdfDoc.getPage(pdfDoc.getPageCount() - 1);

/**
 * pdfDoc is the document representation from the pdf-lib
 *
 * size contains the width and height
 *
 * https://pdf-lib.js.org/docs/api/#const-pagesizes
 */
const addNewPdfPage = ({ pdfDoc, size }) => {
  const lastPdfPage = getLastPdfPage(pdfDoc);
  const lastPdfPageSize = lastPdfPage.getSize();
  const { width = lastPdfPageSize.width, height = lastPdfPageSize.height } =
    size ?? {};
  return pdfDoc.addPage([width, height]);
};

//----------------------------------------------------------------------------//

const centralizeOnSize = (onSize, contentSize) =>
  Math.ceil(onSize / 2) - Math.ceil(contentSize / 2);

//----------------------------------------------------------------------------//

module.exports = {
  loadPdfFonts,
  hex2rgb,
  hex2pdfRGB,
  COLOR,
  getTopBottomLeftRightValues,
  getPDFCoordsLimits,
  getPDFCoordsFromPage,
  getPDFCompensateRotation,
  getPDFCoordsInsideRectangle,
  getLastPdfPage,
  addNewPdfPage,
  centralizeOnSize,
};
