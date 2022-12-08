import type { PDFDocument, PDFPage } from "pdf-lib";

import type { IPoint, ISize } from "@/utils/math/geometry";

import type { IRenderSignaturesWithoutPositionResult } from "@/pdflibUtils/signatures/render/renderSignaturesWithoutPosition";

import type { ISealSize } from "./definitions";

//---//

import { centralizeRectangleOnSize } from "@/utils/math/geometry";

import { addNewPage } from "@/pdflibUtils";

//----------------------------------------------------------------------------//

interface ICalculateSealPointOptions extends ISize {
  signaturesWithoutPosition: IRenderSignaturesWithoutPositionResult;
}

interface ICalculateSealPointReturn extends IPoint {
  shouldAddPage: boolean;
}

/** x, y values */
const calculateSealPoint = ({
  width,
  height,
  signaturesWithoutPosition,
}: ICalculateSealPointOptions): ICalculateSealPointReturn => {
  const { pdfSignatures, signaturesPage, signaturesRowHeight, pageConfig } =
    signaturesWithoutPosition;

  const { pageSize, pageContentRectangle, pageContentCoordsLimits } =
    signaturesPage!;

  const centralX = centralizeRectangleOnSize(pageSize.width, width);

  let x = centralX,
    y = pageContentCoordsLimits.yTop - (signaturesRowHeight + height),
    yTop = 0,
    shouldAddPage = false;

  const pdfSignaturesLength = pdfSignatures.length;
  if (pdfSignaturesLength === 0) {
    return {
      x,
      y,
      shouldAddPage,
    };
  }

  const signature = pdfSignatures[pdfSignaturesLength - 1];
  const signatureComputedCoords =
    signature.getComputedCoords(pageContentRectangle);

  x = centralX;
  y =
    signatureComputedCoords.yBottom -
    (pageConfig.contentRowsGap + signaturesRowHeight + height);

  if (y > pageContentCoordsLimits.yBottom) {
    return {
      x,
      y,
      shouldAddPage,
    };
  }

  x = pageContentCoordsLimits.xRight - width;
  y = pageContentCoordsLimits.yBottom;
  yTop = y + height;

  if (
    signatureComputedCoords.xRight >= x &&
    yTop >= signatureComputedCoords.yBottom
  ) {
    x = centralX;
    y = pageContentCoordsLimits.yTop - (signaturesRowHeight + height);
    return {
      x,
      y,
      shouldAddPage: true,
    };
  }

  return { x, y, shouldAddPage };
};

//----------------------------------------------------------------------------//

interface IGetPageOptions {
  pdfDoc: PDFDocument;
  signaturesWithoutPosition: IRenderSignaturesWithoutPositionResult;
}

const getPage = ({
  pdfDoc,
  signaturesWithoutPosition: { signaturesPage },
}: IGetPageOptions) => {
  if (!signaturesPage) return addNewPage({ pdfDoc });
  return signaturesPage;
};

//----------------------------------------------------------------------------//

export interface ISealCalculatePositionOptions {
  pdfDoc: PDFDocument;
  sealSize: ISealSize;
  signaturesWithoutPosition: IRenderSignaturesWithoutPositionResult;
}

export interface ISealCalculatePositionReturn extends IPoint, ISize {
  pdfPage: PDFPage;
}

export const sealCalculatePosition = ({
  pdfDoc,
  sealSize,
  signaturesWithoutPosition,
}: ISealCalculatePositionOptions): ISealCalculatePositionReturn => {
  const sealScale = sealSize.scale ?? 1;
  const signaturesPage = getPage({ pdfDoc, signaturesWithoutPosition });
  signaturesWithoutPosition.signaturesPage = signaturesPage;

  let pdfPage: PDFPage = signaturesPage.pdfPage,
    width = sealSize.width * sealScale,
    height = sealSize.height * sealScale;

  const point = calculateSealPoint({
    width,
    height,
    signaturesWithoutPosition,
  });

  if (point.shouldAddPage) {
    const {
      pageSize,
      pageMargins,
      pageContentRectangle,
      pageContentCoordsLimits,
    } = signaturesPage;
    pdfPage = addNewPage({
      pdfDoc,
      pageSize,
      pageMargins,
      pageContentRectangle,
      pageContentCoordsLimits,
    }).pdfPage;
  }

  return {
    pdfPage,
    x: point.x,
    y: point.y,
    width,
    height,
  };
};

export default sealCalculatePosition;
