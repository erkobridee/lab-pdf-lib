import { isValidHexColor, isNumber } from "@/utils/data/is";

//----------------------------------------------------------------------------//

export const MAX_COLOR_CHANNEL_VALUE = 255;

export const getSafeColorChannelValue = (value: number = 0) => {
  if (value < 0) return 0;
  if (value > MAX_COLOR_CHANNEL_VALUE) return MAX_COLOR_CHANNEL_VALUE;
  return value;
};

//----------------------------------------------------------------------------//

export enum HextoRgbOption {
  OBJECT = "object",
  ARRAY = "array",
  CSS = "css",
}

export type THextoRgbOptions = `${HextoRgbOption}`;

export interface IHextoRgbOptions {
  alpha?: boolean | number;
  format?: THextoRgbOptions;
  defaultHex?: string;
}

export interface IHextoRgbObject {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

/** [ red, green, blue, alpha ] */
export type THextoRgbArray = [number, number, number, number];

/** rgb( red green blue / alpha % ) */
export type THextoRgbString = string;

// https://github.com/sindresorhus/hex-rgb/blob/8962ac2193bb6e482d56bfe081ade7a4dc1103a2/index.js
export function hex2rgb(
  hex: string,
  {
    format: outputFormat = HextoRgbOption.OBJECT,
    alpha: useAlpha,
    defaultHex,
  }: IHextoRgbOptions = {}
) {
  if (!isValidHexColor(hex)) {
    if (isValidHexColor(defaultHex)) {
      hex = defaultHex as string;
    } else {
      throw new TypeError("Expected a valid hex string");
    }
  }

  hex = hex.replace(/^#/, "");
  let alphaFromHex = 1;

  if (hex.length === 8) {
    alphaFromHex =
      Number.parseInt(hex.slice(6, 8), 16) / MAX_COLOR_CHANNEL_VALUE;
    hex = hex.slice(0, 6);
  }

  if (hex.length === 4) {
    alphaFromHex =
      Number.parseInt(hex.slice(3, 4).repeat(2), 16) / MAX_COLOR_CHANNEL_VALUE;
    hex = hex.slice(0, 3);
  }

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const number = Number.parseInt(hex, 16);
  const red = number >> 16;
  const green = (number >> 8) & MAX_COLOR_CHANNEL_VALUE;
  const blue = number & MAX_COLOR_CHANNEL_VALUE;

  const alpha = isNumber(useAlpha) ? (useAlpha as number) : alphaFromHex;

  if (outputFormat === HextoRgbOption.ARRAY) {
    return [red, green, blue, alpha];
  }

  if (outputFormat === HextoRgbOption.CSS) {
    const alphaString =
      alpha === 1 ? "" : ` / ${Number((alpha * 100).toFixed(2))}%`;
    return `rgb(${red} ${green} ${blue}${alphaString})`;
  }

  return { red, green, blue, alpha };
}

export default hex2rgb;
