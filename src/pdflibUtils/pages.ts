import type { PDFDocument } from "pdf-lib";

import { ISize } from "@/utils/math/geometry";

//----------------------------------------------------------------------------//

export const getLastPdfPage = (pdfDoc: PDFDocument) =>
  pdfDoc.getPage(pdfDoc.getPageCount() - 1);

/**
 * get the pdf page index of a requested page index
 *
 * if the page index is bellow 0, that will get the first page
 *
 * if the page index is equals or greater than the pages count, that will get the last page
 *
 * @param {PDFDocument} pdfDoc
 * @param {number} pageIndex
 * @returns {number} pageIndex
 */
export const getSafePdfPageIndex = (pdfDoc: PDFDocument, pageIndex = 0) => {
  const pagesCount = pdfDoc.getPageCount();
  if (pageIndex < 0) {
    pageIndex = 0;
  } else if (pageIndex >= pagesCount) {
    pageIndex = pagesCount - 1;
  }
  return pageIndex;
};

/**
 * get the pdf page of a requested page index
 *
 * if the page index is bellow 0, that will get the first page
 *
 * if the page index is equals or greater than the pages count, that will get the last page
 *
 * @param {PDFDocument} pdfDoc
 * @param {number} pageIndex
 * @returns {PDFPage} pdfPage
 */
export const getSafePdfPage = (pdfDoc: PDFDocument, pageIndex = 0) =>
  pdfDoc.getPage(getSafePdfPageIndex(pdfDoc, pageIndex));

//----------------------------------------------------------------------------//

interface IAddNewPdfPageOptions {
  pdfDoc: PDFDocument;
  size?: ISize;
}

/**
 * pdfDoc is the document representation from the pdf-lib
 *
 * size contains the width and height
 *
 * https://pdf-lib.js.org/docs/api/#const-pagesizes
 */
export const addNewPdfPage = ({ pdfDoc, size }: IAddNewPdfPageOptions) => {
  const lastPdfPage = getLastPdfPage(pdfDoc);
  const lastPdfPageSize = lastPdfPage.getSize();
  const { width = lastPdfPageSize.width, height = lastPdfPageSize.height } =
    size ?? {};
  return pdfDoc.addPage([width, height]);
};
