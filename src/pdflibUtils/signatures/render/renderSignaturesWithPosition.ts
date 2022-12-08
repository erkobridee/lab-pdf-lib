import type { PDFDocument, PDFPage } from "pdf-lib";

import type { Signatory } from "@/entities";

import type { IPDFRectangle, IPDFSignatureRenderConfig } from "@/pdflibUtils";

//---//

import {
  getPDFCoordsFromPage,
  getSafePdfPage,
  PDFSignature,
} from "@/pdflibUtils";

//----------------------------------------------------------------------------//

interface IPDFPagesMapItem {
  index: number;
  pdfPage: PDFPage;
  contentRectangle: IPDFRectangle;
}

interface IRenderSignaturesWithPositionOptions {
  pdfDoc: PDFDocument;
  renderConfig: IPDFSignatureRenderConfig;

  signatories: Signatory[];

  signatureTotalHeight: number;
}

export const renderSignaturesWithPosition = ({
  pdfDoc,
  renderConfig,
  signatories,
  signatureTotalHeight,
}: IRenderSignaturesWithPositionOptions) => {
  const pdfPagesMap = new Map<number, IPDFPagesMapItem>();

  const loadPage = (index: number) => {
    if (pdfPagesMap.has(index)) {
      return pdfPagesMap.get(index)!;
    }

    const pdfPage = getSafePdfPage(pdfDoc, index);
    const item: IPDFPagesMapItem = {
      index,
      pdfPage,
      contentRectangle: getPDFCoordsFromPage({ pdfPage }),
    };
    pdfPagesMap.set(index, item);
    return item;
  };

  signatories.forEach((signatory) => {
    const {
      signatureRenderPosition,
      fullName: name,
      signedDate: date,
      signedLocation: location,
    } = signatory;
    if (!signatureRenderPosition) return;

    const {
      page,
      x,
      y,
      height = signatureTotalHeight,
    } = signatureRenderPosition;

    const pdfSignature = new PDFSignature({
      name,
      date: date!,
      location: location!,
      x,
      y,
      height,
      calculateWidthsOptions: { renderConfig },
    });

    const { pdfPage, contentRectangle } = loadPage(page);
    pdfSignature.draw({ pdfPage, contentRectangle });
  });
};

export default renderSignaturesWithPosition;
