import type { PDFDocument, PDFPage } from "pdf-lib";

import type {
  ISize,
  IRectangleCoordsLimits,
  TRectangleSpacings,
} from "@/utils/math/geometry";

import type { IPDFRectangle } from "@/pdflibUtils";

//---//

import { isUndefined } from "@/utils/data";

import {
  addNewPdfPage,
  getPDFCoordsFromPage,
  getPDFCoordsLimits,
} from "@/pdflibUtils";

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
  pageContentCoordsLimits: IRectangleCoordsLimits;
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

  return {
    pdfPage,
    pageSize: pageSize as ISize,
    pageContentRectangle: pageContentRectangle as IPDFRectangle,
    pageContentCoordsLimits: pageContentCoordsLimits as IRectangleCoordsLimits,
    pageMargins,
  };
};

//----------------------------------------------------------------------------//
