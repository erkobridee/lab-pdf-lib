import type { PDFDocument, PDFPage } from "pdf-lib";

import type { ISize, TRectangleSpacings } from "@/utils/math/geometry";

import type { IPDFRectangle, IPDFRectangleCoordsLimits } from "@/pdflibUtils";

//---//

import { isUndefined } from "@/utils/data";

import {
  shouldDebug,
  getDebugRenderConfig,
  addNewPdfPage,
  getPDFCoordsFromPage,
  getPDFCoordsLimits,
} from "@/pdflibUtils";

//----------------------------------------------------------------------------//

interface IDebugHelperOptions {
  pdfPage: PDFPage;
  pageContentRectangle: IPDFRectangle;
  pageContentCoordsLimits: IPDFRectangleCoordsLimits;
  pageMargins: number;
}

const DEBUG_KEY = "renderPage";
const debugHelper = ({
  pdfPage,
  pageContentRectangle,
  pageContentCoordsLimits,
  pageMargins,
}: IDebugHelperOptions) => {
  if (!shouldDebug(DEBUG_KEY)) return;

  /*
  console.log("pdflibUtils/signatures/helpers/pages -> debugHelper", {
    pageContentRectangle,
    pageContentCoordsLimits,
    pageMargins,
  });
  */

  const { margins, verticalGuideLine, horizontalGuideLines } =
    getDebugRenderConfig(DEBUG_KEY);

  pdfPage.drawRectangle({
    ...pageContentRectangle,

    ...margins,
  });

  //---===---//

  const { xLeft, xRight, yTop, yBottom } = pageContentCoordsLimits;

  //---===---//
  // vertical lines

  const x = pageContentRectangle.width / 2 + pageMargins;
  pdfPage.drawLine({
    ...verticalGuideLine,
    end: { x, y: yTop },
    start: { x, y: yBottom },
  });

  //---===---//
  // horizontal lines

  const distance = 4;
  const middleX = xRight / 2 + pageMargins / 2;

  let yLine = yTop + distance;
  pdfPage.drawLine({
    ...horizontalGuideLines,
    start: { x: xLeft, y: yLine },
    end: { x: middleX, y: yLine },
  });

  yLine = yBottom - distance;
  pdfPage.drawLine({
    ...horizontalGuideLines,
    start: { x: middleX, y: yLine },
    end: { x: xRight, y: yLine },
  });
};

//----------------------------------------------------------------------------//

export interface IPageConfig {
  margins: number;

  contentGap: number;
  contentRowsGap: number;
  contentColumnsGap: number;
}

//----------------------------------------------------------------------------//

interface ISignaturesPageBase {
  pageSize: ISize;
  pageContentRectangle: IPDFRectangle;
  pageContentCoordsLimits: IPDFRectangleCoordsLimits;
  pageMargins: TRectangleSpacings;
}

export interface ISignaturesPage extends ISignaturesPageBase {
  pdfPage: PDFPage;
}

interface IAddNewPageOptions extends Partial<ISignaturesPageBase> {
  pdfDoc: PDFDocument;
}

export const addNewPage = ({
  pdfDoc,
  pageSize,
  pageContentRectangle,
  pageContentCoordsLimits,
  pageMargins = 10,
}: IAddNewPageOptions): ISignaturesPage => {
  const pdfPage = addNewPdfPage({ pdfDoc, size: pageSize });

  if (isUndefined(pageSize)) {
    pageSize = pdfPage.getSize();
  }

  if (isUndefined(pageContentRectangle)) {
    pageContentRectangle = getPDFCoordsFromPage({
      spacings: pageMargins,
      pdfPage,
    });
  }

  if (isUndefined(pageContentCoordsLimits) && pageContentRectangle) {
    pageContentCoordsLimits = getPDFCoordsLimits({
      rectangle: pageContentRectangle,
    });
  }

  debugHelper({
    pdfPage,
    pageContentRectangle,
    pageContentCoordsLimits,
    pageMargins: pageMargins as number,
  });

  return {
    pdfPage,
    pageSize,
    pageContentRectangle,
    pageContentCoordsLimits,
    pageMargins,
  };
};

//----------------------------------------------------------------------------//
