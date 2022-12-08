import type { RGB, PDFPage, PDFPageDrawTextOptions } from "pdf-lib";

import type { IPoint, ISize, TRectangleSpacings } from "@/utils/math/geometry";

import type {
  IPDFRectangle,
  IPDFRectangleCoordsLimits,
  TColor,
  ISignatureFonts,
} from "@/pdflibUtils";

//---//

import { roundUp } from "@/utils/math";
import { getRectangleSpacings } from "@/utils/math/geometry";

import {
  shouldDebug,
  getDebugRenderConfig,
  COLOR,
  getRGB,
  getPDFCoordsInsideRectangle,
  getPDFCoordsLimits,
} from "@/pdflibUtils";

import {
  IPDFSignatureDataProps,
  IPDFSignatureData,
  PDFSignatureData,
} from "./PDFSignatureData";

//----------------------------------------------------------------------------//
// @begin: process render pdf signature config

interface IRenderSignatureConfigBase {
  scale: number;
  paddings: TRectangleSpacings;
  textRowsGap: number;
  fonts: ISignatureFonts;
  displayLocation: boolean;
  displaySizedHash: boolean;
}

export interface IRenderSignatureConfig
  extends Partial<IRenderSignatureConfigBase> {
  fonts: ISignatureFonts;
  backgroundColor?: TColor;
  textColor?: TColor;
  textHashColor?: TColor;
}

//---//

export interface IPDFSignatureRenderConfig extends IRenderSignatureConfigBase {
  fonts: ISignatureFonts;
  backgroundColor: RGB;
  textColor: RGB;
  textHashColor: RGB;
}

//---//

export const processPDFSignatureRenderConfig = ({
  scale = 1,
  paddings = 5,
  textRowsGap = 5,
  fonts,
  backgroundColor = COLOR.FAFAFA,
  textColor = COLOR.BLACK,
  textHashColor = COLOR.SLATE_GRAY,
  displayLocation = false,
  displaySizedHash = true,
}: IRenderSignatureConfig): IPDFSignatureRenderConfig => ({
  scale,
  paddings: getRectangleSpacings(paddings, scale),
  textRowsGap,
  fonts,
  displayLocation,
  displaySizedHash,
  backgroundColor: getRGB(backgroundColor),
  textColor: getRGB(textColor),
  textHashColor: getRGB(textHashColor),
});

// @end: process render pdf signature config
//----------------------------------------------------------------------------//
// @begin: logic to calculate the pdf signature height to be rendered

export interface ICalculatePDFSignatureOptions {
  renderConfig: IPDFSignatureRenderConfig;
  maxSignatureAvailableWidth?: number;
}

export interface IPDFSignatureHeights {
  name: number;
  date: number;
  location: number;
  total: number;
}

export const calculatePDFSignatureHeight = ({
  renderConfig: {
    paddings,
    scale,
    textRowsGap,
    fonts,
    displayLocation = false,
  },
}: ICalculatePDFSignatureOptions): IPDFSignatureHeights => {
  const { nameHeightAtDesiredFontSize, infoHeightAtDesiredFontSize } = fonts;

  const name = nameHeightAtDesiredFontSize;
  const date = infoHeightAtDesiredFontSize;
  const location = displayLocation ? infoHeightAtDesiredFontSize : 0;

  const spacings = getRectangleSpacings(paddings, scale);

  const total =
    spacings.top +
    name +
    textRowsGap +
    date +
    (displayLocation ? textRowsGap + location : 0) +
    spacings.bottom;

  return {
    name,
    date,
    location,
    total,
  };
};

// @end: logic to calculate the pdf signature height to be rendered
//----------------------------------------------------------------------------//
// @begin: definitions

export const PDF_SIGNATURE_WIDTH_NOT_DEFINED = -1;

export enum PDFSignaturePointCoordSystem {
  /** point ( x: 0, y: 0 ) is located at left top corner */
  WEB = "web",

  /** point ( x: 0, y: 0 ) is located at left bottom corner */
  PDF = "pdf",
}

export type TPDFSignaturePointCoordSystem = `${PDFSignaturePointCoordSystem}`;

// @end: definitions
//----------------------------------------------------------------------------//
// @begin: PDFSignature class definition

interface IDrawOptions {
  pdfPage: PDFPage;
  contentRectangle: IPDFRectangle;
}

export interface IPDFSignatureProps
  extends IPDFSignatureDataProps,
    Partial<IPoint> {
  height: number;
  calculateWidthsOptions: ICalculatePDFSignatureOptions;
}

export interface IPDFSignature extends IPoint, ISize {
  getData: () => IPDFSignatureData;
  updatePoint: (point: IPoint) => void;
  draw: (options: IDrawOptions) => void;
  getComputedCoords: (
    pageContentRectangle?: IPDFRectangle
  ) => IPDFRectangleCoordsLimits;
}

/**
 * the x, y position passed to the constructuror represents the web page orientation
 * where the point ( x: 0, y: 0 ) is located at left top corner
 */
export class PDFSignature extends PDFSignatureData implements IPDFSignature {
  pointCoordsSystem: TPDFSignaturePointCoordSystem;
  renderConfig: IPDFSignatureRenderConfig;

  x: number;
  y: number;
  height: number;

  longestAttributeWidth: string;

  nameWidth: number;
  dateWidth: number;
  locationWidth: number;
  sizedHashWidth: number;
  totalWidth: number;

  width: number;

  //--------------------------------------------------------------------------//
  // @begin: static methods

  static processRenderConfig = processPDFSignatureRenderConfig;

  static calculateHeight = calculatePDFSignatureHeight;

  // @end: static methods
  //--------------------------------------------------------------------------//

  private isWidthsDefined() {
    return ["name", "date", "location"].includes(this.longestAttributeWidth);
  }

  private calculateWidths({
    renderConfig,
    maxSignatureAvailableWidth = PDF_SIGNATURE_WIDTH_NOT_DEFINED,
  }: ICalculatePDFSignatureOptions) {
    const { paddings, scale, fonts, displayLocation = false } = renderConfig;
    const spacings = getRectangleSpacings(paddings, scale);

    const {
      nameFont,
      nameFontSize,
      infoFont,
      infoFontSize,
      hashFont,
      hashFontSize,
    } = fonts;

    this.renderConfig = renderConfig;

    this.sizedHashWidth = roundUp(
      hashFont.widthOfTextAtSize(this.sizedHash, hashFontSize)
    );

    let currentWidth = 0,
      longestWidth = 0;

    currentWidth = roundUp(nameFont.widthOfTextAtSize(this.name, nameFontSize));
    this.nameWidth = currentWidth;
    this.longestAttributeWidth = "name";
    longestWidth = currentWidth;

    currentWidth = roundUp(infoFont.widthOfTextAtSize(this.date, infoFontSize));
    this.dateWidth = currentWidth;
    if (currentWidth > longestWidth) {
      this.longestAttributeWidth = "date";
      longestWidth = currentWidth;
    }

    if (displayLocation) {
      currentWidth = roundUp(
        infoFont.widthOfTextAtSize(this.location, infoFontSize)
      );
      this.locationWidth = currentWidth;
      if (currentWidth > longestWidth) {
        this.longestAttributeWidth = "location";
        longestWidth = currentWidth;
      }
    }

    const totalWidth = spacings.left + longestWidth + spacings.right;
    this.totalWidth = totalWidth;

    this.width =
      totalWidth < maxSignatureAvailableWidth
        ? maxSignatureAvailableWidth
        : totalWidth;
  }

  //--------------------------------------------------------------------------//

  private initWidths() {
    this.longestAttributeWidth = "";

    this.nameWidth = PDF_SIGNATURE_WIDTH_NOT_DEFINED;
    this.dateWidth = PDF_SIGNATURE_WIDTH_NOT_DEFINED;
    this.locationWidth = PDF_SIGNATURE_WIDTH_NOT_DEFINED;
    this.sizedHashWidth = PDF_SIGNATURE_WIDTH_NOT_DEFINED;
    this.totalWidth = PDF_SIGNATURE_WIDTH_NOT_DEFINED;

    this.width = PDF_SIGNATURE_WIDTH_NOT_DEFINED;
  }

  constructor({
    x,
    y,
    height,
    calculateWidthsOptions,
    ...superProps
  }: IPDFSignatureProps) {
    super(superProps);

    this.pointCoordsSystem = PDFSignaturePointCoordSystem.WEB;

    this.x = x ?? PDF_SIGNATURE_WIDTH_NOT_DEFINED;
    this.y = y ?? PDF_SIGNATURE_WIDTH_NOT_DEFINED;
    this.height = height;

    this.initWidths();
    this.calculateWidths(calculateWidthsOptions);
  }

  //--------------------------------------------------------------------------//
  // @begin: rectangle methods

  /**
   * to update the point position related to the pdf page orientation
   * where the point ( x: 0, y: 0 ) is located at left bottom corner
   *
   * @param {IPoint} point
   */
  private updatePointToPDFCoords({ x, y }: IPoint) {
    this.pointCoordsSystem = PDFSignaturePointCoordSystem.PDF;

    this.x = x;
    this.y = y;
  }

  private toPDFCoords(pageContentRectangle: IPDFRectangle) {
    if (!this.isWidthsDefined()) return false;
    if (this.pointCoordsSystem === PDFSignaturePointCoordSystem.PDF)
      return true;

    const { x, y } = getPDFCoordsInsideRectangle({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rectangle: pageContentRectangle,
    });

    this.updatePointToPDFCoords({ x, y });

    return true;
  }

  private getBackgroundRectangle(
    pageContentRectangle?: IPDFRectangle
  ): IPDFRectangle {
    pageContentRectangle && this.toPDFCoords(pageContentRectangle);

    if (this.pointCoordsSystem !== PDFSignaturePointCoordSystem.PDF) {
      throw new Error(
        `It's not the PDF point coords system, current one in use ${this.pointCoordsSystem}`
      );
    }

    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  private getContentRectangle(referenceRectangle?: IPDFRectangle) {
    referenceRectangle = referenceRectangle ?? this.getBackgroundRectangle();
    return getPDFCoordsInsideRectangle({
      rectangle: referenceRectangle,
      rectanglePaddings: this.renderConfig.paddings,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  }

  // @end: rectangle methods
  //--------------------------------------------------------------------------//
  // @begin: render methods

  private drawBackground({ pdfPage, contentRectangle }: IDrawOptions) {
    const { backgroundColor } = this.renderConfig;

    const DEBUG_KEY = "renderSignature";
    const extraConfig = shouldDebug(DEBUG_KEY)
      ? getDebugRenderConfig(DEBUG_KEY)
      : {};

    pdfPage.drawRectangle({
      color: backgroundColor,
      ...contentRectangle,
      ...extraConfig,
    });
  }

  private drawSizedHash({ pdfPage, contentRectangle }: IDrawOptions) {
    const { textColor: color, fonts, textRowsGap } = this.renderConfig;
    const { hashFont: font, hashFontSize: size } = fonts;

    const x = contentRectangle.x + contentRectangle.width - this.sizedHashWidth;
    const y = contentRectangle.y - Math.floor(textRowsGap / 2);

    pdfPage.drawText(this.sizedHash, {
      color,
      font,
      size,
      x,
      y,
    });
  }

  private drawTexts({ pdfPage, contentRectangle }: IDrawOptions) {
    const { textColor: color, textRowsGap, fonts } = this.renderConfig;
    const {
      nameFont,
      nameFontSize,
      infoFont,
      infoFontSize,
      infoHeightAtDesiredFontSize,
    } = fonts;

    let x = contentRectangle.x,
      y = contentRectangle.y + textRowsGap;

    const infoTextOptions: PDFPageDrawTextOptions = {
      color,
      font: infoFont,
      size: infoFontSize,
    };

    //------------------------------------------------------------------------//

    const DEBUG_KEY = "renderSignatureContent";
    if (shouldDebug(DEBUG_KEY)) {
      pdfPage.drawRectangle({
        ...contentRectangle,
        ...getDebugRenderConfig(DEBUG_KEY),
      });
    }

    //------------------------------------------------------------------------//
    // @begin: location line

    if (this.renderConfig.displayLocation) {
      pdfPage.drawText(this.location, {
        x,
        y,
        ...infoTextOptions,
      });

      y += infoHeightAtDesiredFontSize + textRowsGap;
    }

    // @end: location line
    //------------------------------------------------------------------------//
    // @begin: date line

    pdfPage.drawText(this.date, {
      x,
      y,
      ...infoTextOptions,
    });

    y += infoHeightAtDesiredFontSize + textRowsGap * 2;

    // @end: date line
    //------------------------------------------------------------------------//
    // @begin: name line

    pdfPage.drawText(this.name, {
      x,
      y,
      font: nameFont,
      size: nameFontSize,
      color,
    });

    // @end: name line
    //------------------------------------------------------------------------//
  }

  draw({ pdfPage, contentRectangle }: IDrawOptions) {
    if (
      this.x <= PDF_SIGNATURE_WIDTH_NOT_DEFINED &&
      this.y <= PDF_SIGNATURE_WIDTH_NOT_DEFINED
    ) {
      throw new Error("PDFSignature.( x, y ) values are not defined");
    }

    if (this.x <= PDF_SIGNATURE_WIDTH_NOT_DEFINED) {
      throw new Error("PDFSignature.x value is not defined");
    }

    if (this.y <= PDF_SIGNATURE_WIDTH_NOT_DEFINED) {
      throw new Error("PDFSignature.y value is not defined");
    }

    contentRectangle = this.getBackgroundRectangle(contentRectangle);
    this.drawBackground({ pdfPage, contentRectangle });

    if (this.renderConfig.displaySizedHash) {
      this.drawSizedHash({ pdfPage, contentRectangle });
    }

    contentRectangle = this.getContentRectangle(contentRectangle);
    this.drawTexts({ pdfPage, contentRectangle });
  }

  // @end: render methods
  //--------------------------------------------------------------------------//
  // helper to calculate the dynamic position of the document seal

  getComputedCoords(pageContentRectangle?: IPDFRectangle) {
    const rectangle = this.getBackgroundRectangle(pageContentRectangle);
    return getPDFCoordsLimits({ rectangle });
  }

  //--------------------------------------------------------------------------//

  updatePoint(point: IPoint) {
    this.updatePointToPDFCoords(point);
  }

  getData() {
    return {
      name: this.name,
      date: this.date,
      location: this.location,
      hash: this.hash,
      sizedHash: this.sizedHash,
    };
  }
}

// @end: PDFSignature class definition
//----------------------------------------------------------------------------//
