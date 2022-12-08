import type { PDFDocument } from "pdf-lib";

import type { Signatory } from "@/entities";

import type {
  IPageConfig,
  ISignaturesPage,
  IPDFSignatureRenderConfig,
  IPDFSignature,
} from "@/pdflibUtils";

//---//

import { roundDown } from "@/utils/math";

import { addNewPage, PDFSignature } from "@/pdflibUtils/signatures";

//----------------------------------------------------------------------------//

interface IRenderSignaturesWithoutPositionOptions {
  pdfDoc: PDFDocument;
  pageConfig: IPageConfig;
  renderConfig: IPDFSignatureRenderConfig;
  signatories: Signatory[];
  signatureTotalHeight: number;
  signaturesRowHeight: number;
}

export interface IRenderSignaturesWithoutPositionResult {
  signaturesPage?: ISignaturesPage;
  pageConfig: IPageConfig;
  signaturesRowHeight: number;
  pdfSignatures: IPDFSignature[];
}

export const renderSignaturesWithoutPosition = ({
  pdfDoc,
  pageConfig,
  renderConfig,
  signatories,
  signatureTotalHeight,
  signaturesRowHeight,
}: IRenderSignaturesWithoutPositionOptions): IRenderSignaturesWithoutPositionResult => {
  let signaturesPage: ISignaturesPage = addNewPage({ pdfDoc }),
    pdfSignatures: IPDFSignature[] = [];

  if (signatories.length === 0) {
    return {
      signaturesPage,
      pageConfig,
      signaturesRowHeight,
      pdfSignatures,
    };
  }

  //--------------------------------------------------------------------------//

  const { contentColumnsGap, contentRowsGap } = pageConfig;
  const { pdfPage, pageContentCoordsLimits, pageContentRectangle } =
    signaturesPage;

  const availableHeight =
    pageContentCoordsLimits.yTop - pageContentCoordsLimits.yBottom;

  const availableWidth = pageContentRectangle.width;
  const halfAvailableWidth = availableWidth / 2;

  const toAdjustWidth = contentColumnsGap > 0 ? contentRowsGap / 2 : 0;
  const maxSignatureAvailableWidth = halfAvailableWidth - toAdjustWidth;

  const maxRowsCount = roundDown(availableHeight / signaturesRowHeight);

  //--------------------------------------------------------------------------//

  let row = 0,
    x = 0;

  pdfSignatures = signatories.map(
    ({ fullName: name, signedDate, signedLocation: location }) => {
      const pdfSignature = new PDFSignature({
        name,
        date: signedDate!,
        location,
        height: signatureTotalHeight,
        calculateWidthsOptions: {
          renderConfig,
          maxSignatureAvailableWidth,
        },
      });

      const pdfSignatureWidth = pdfSignature.width;

      if (x + pdfSignatureWidth > availableWidth) {
        row++;
        x = 0;
      }

      if (row >= maxRowsCount) {
        row = 0;

        const {
          pageSize,
          pageContentCoordsLimits,
          pageContentRectangle,
          pageMargins,
        } = signaturesPage;
        signaturesPage = addNewPage({
          pdfDoc,
          pageSize,
          pageContentCoordsLimits,
          pageContentRectangle,
          pageMargins,
        });
      }

      pdfSignature.updatePoint({ x, y: signaturesRowHeight * row });

      pdfSignature.draw({
        pdfPage,
        contentRectangle: pageContentRectangle,
      });

      if (pdfSignatureWidth > maxSignatureAvailableWidth) {
        row++;
        x = 0;
      } else {
        x += halfAvailableWidth + toAdjustWidth;
      }

      return pdfSignature;
    }
  );

  // console.log({ pdfSignatures });

  //--------------------------------------------------------------------------//

  return {
    signaturesPage,
    pageConfig,
    signaturesRowHeight,
    pdfSignatures,
  };
};

export default renderSignaturesWithoutPosition;
