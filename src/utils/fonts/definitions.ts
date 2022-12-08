const path = require("path");

import { FONTS_DIR } from "@/utils/fs";

//----------------------------------------------------------------------------//

/*
  font-family: Architects Daughter
  https://fonts.google.com/specimen/Architects+Daughter
*/

export enum FontFamily {
  HELVETICA = "Helvetica",
  TIMES = "Times",
  TIMES_ROMAN = "Times Roman",
  ARCHITECTS_DAUGHTER = "Architects Daughter",
  PATRICK_HAND = "Patrick Hand",
}

export type TFontFamily = `${FontFamily}`;

export type TFontFamilyFromFile =
  | `${FontFamily.PATRICK_HAND}`
  | `${FontFamily.ARCHITECTS_DAUGHTER}`;

export enum FontStyle {
  NORMAL = "normal",
  BOLD = "bold",
  ITALIC = "italic",
  BOLD_ITALIC = "bolditalic",
}

export type TFontStyle = `${FontStyle}`;

//----------------------------------------------------------------------------//

export interface IFont {
  normal: string;
  bold?: string;
  italics?: string;
  bolditalics?: string;
}

export type TFontKeys = keyof IFont;

const architectsDaughterFilePath = path.join(
  FONTS_DIR,
  "architects-daughter-regular.ttf"
);

const patrickHandFilePath = path.join(FONTS_DIR, "patrick-hand-regular.ttf");

export const fonts: Record<string, IFont> = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
  ArchitectsDaughter: {
    normal: architectsDaughterFilePath,
    bold: architectsDaughterFilePath,
  },
  PatrickHand: {
    normal: patrickHandFilePath,
    bold: patrickHandFilePath,
  },
};

//----------------------------------------------------------------------------//

export const FONTS_ATTR_MAP = {
  [`${FontFamily.HELVETICA}`]: "Helvetica",
  [`${FontFamily.TIMES}`]: "Times",
  [`${FontFamily.TIMES_ROMAN}`]: "Times",
  [`${FontFamily.ARCHITECTS_DAUGHTER}`]: "ArchitectsDaughter",
  [`${FontFamily.PATRICK_HAND}`]: "PatrickHand",
} as const;

export const getFontFilePath = (
  name: TFontFamilyFromFile,
  style: TFontStyle = FontStyle.NORMAL
) => {
  const attrName = FONTS_ATTR_MAP[name];
  const font = fonts[attrName];
  switch (style) {
    case FontStyle.ITALIC:
    case FontStyle.BOLD_ITALIC:
      style += "s";
      break;
  }
  return font.hasOwnProperty(style) ? font[style as TFontKeys] : font.normal;
};

//----------------------------------------------------------------------------//

export default fonts;
