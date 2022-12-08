import type { RGB } from "pdf-lib";

import { rgb } from "pdf-lib";

import {
  IHextoRgbObject,
  MAX_COLOR_CHANNEL_VALUE,
  getSafeColorChannelValue,
  hex2rgb,
} from "@/utils/colors";

import { isString, isArray, isObjectAttributesDefined } from "@/utils/data/is";

//----------------------------------------------------------------------------//

const RGBAttributes = ["type", "red", "green", "blue"];

export type TColor = string | number[] | RGB;

//----------------------------------------------------------------------------//

/**
  transforms a rgb color (channel value between 0 and 255) into a
  pdf rgb color (channel value between 0 and 1)
*/
export const pdfRGB = (red: number, green: number, blue: number) =>
  rgb(
    red / MAX_COLOR_CHANNEL_VALUE,
    green / MAX_COLOR_CHANNEL_VALUE,
    blue / MAX_COLOR_CHANNEL_VALUE
  );

export const hex2pdfRGB = (hexString: string) => {
  const { red, green, blue } = hex2rgb(hexString) as IHextoRgbObject;
  return pdfRGB(red, green, blue);
};

//----------------------------------------------------------------------------//

/*
  colors names and its values
  https://www.colorhexa.com/color-names
*/
export const COLOR = {
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

export const getRGB = (color: TColor, defaultColor: RGB = COLOR.WHITE): RGB => {
  if (isString(color)) {
    try {
      return hex2pdfRGB(color as string);
    } catch (e) {
      console.error(e);
      return defaultColor;
    }
  }

  if (isArray(color) && Array(color).length === 3) {
    const colorArray = (color as number[]).map(getSafeColorChannelValue);
    const [red, green, blue] = colorArray;
    return pdfRGB(red, green, blue);
  } else if (isObjectAttributesDefined(color, RGBAttributes)) {
    return color as RGB;
  }

  return defaultColor;
};

//----------------------------------------------------------------------------//
