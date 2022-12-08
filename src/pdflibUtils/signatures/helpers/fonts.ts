import type { PDFDocument, PDFFont } from "pdf-lib";
import { StandardFonts } from "pdf-lib";

import { FontFamily, loadFontFile } from "@/utils/fonts";
import { isDefined } from "@/utils/data/is";
import { roundUp } from "@/utils/math";

const fontkit = require("@pdf-lib/fontkit");

export enum SignatureFontSize {
  NAME = 18,
  /** used for the signature text information, like the signature date */
  INFO = 8,
  HASH = 7,
}

export interface ILoadSignatureFontsOptions {
  nameFontSize: number;
  /** used for the signature text information, like the signature date */
  infoFontSize: number;
  hashFontSize: number;
}

export interface ISignatureFonts {
  nameFont: PDFFont;
  nameFontSize: number;
  nameHeightAtDesiredFontSize: number;

  /** used for the signature text information, like the signature date */
  infoFont: PDFFont;
  infoFontSize: number;
  infoHeightAtDesiredFontSize: number;

  hashFont: PDFFont;
  hashFontSize: number;
  hashHeightAtDesiredFontSize: number;
}

export const loadSignatureFonts = async (
  pdfDoc: PDFDocument,
  options: Partial<ILoadSignatureFontsOptions> = {}
): Promise<ISignatureFonts> => {
  const {
    nameFontSize = SignatureFontSize.NAME,
    infoFontSize = SignatureFontSize.INFO,
    hashFontSize = SignatureFontSize.HASH,
  } = options;

  const fontBuffer = loadFontFile(FontFamily.ARCHITECTS_DAUGHTER);

  let fontName: PDFFont;
  if (isDefined(fontBuffer)) {
    pdfDoc.registerFontkit(fontkit);
    fontName = await pdfDoc.embedFont(fontBuffer);
  } else {
    fontName = await pdfDoc.embedFont(StandardFonts.CourierOblique);
  }

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const nameFont = fontName;
  const infoFont = fontHelvetica;
  const hashFont = fontHelvetica;

  const nameHeightAtDesiredFontSize = roundUp(
    nameFont.heightAtSize(nameFontSize)
  );
  const infoHeightAtDesiredFontSize = roundUp(
    infoFont.heightAtSize(infoFontSize)
  );
  const hashHeightAtDesiredFontSize = roundUp(
    hashFont.heightAtSize(hashFontSize)
  );

  return {
    nameFont,
    nameFontSize,
    nameHeightAtDesiredFontSize,

    /** used for the signature text information, like the signature date */
    infoFont,
    infoFontSize,
    infoHeightAtDesiredFontSize,

    hashFont,
    hashFontSize,
    hashHeightAtDesiredFontSize,
  };
};
