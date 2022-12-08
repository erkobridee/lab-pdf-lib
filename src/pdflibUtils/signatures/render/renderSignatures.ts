import type { PDFDocument } from "pdf-lib";

import type {
  IRenderSignatureConfig,
  IPageConfig,
} from "@/pdflibUtils/signatures";

//---//

import {
  SignatureRenderPositionRequiredAttributes,
  Signatory,
} from "@/entities";

import { isObjectAttributesDefined } from "@/utils/data";

import { loadSignatureFonts, PDFSignature } from "@/pdflibUtils/signatures";

import { renderSignaturesWithPosition } from "./renderSignaturesWithPosition";
import {
  IRenderSignaturesWithoutPositionResult,
  renderSignaturesWithoutPosition,
} from "./renderSignaturesWithoutPosition";
import {
  DEFAULT_SEAL_SIZE,
  TSealRenderPosition,
  renderSignaturesSeal,
} from "./seal";

//----------------------------------------------------------------------------//

interface IRenderSignaturesOptions {
  pdfDoc: PDFDocument;

  acroformId: string;
  signatories: Signatory[];
  sealRenderPosition?: TSealRenderPosition;

  pageMargins?: number;
  pageContentGap?: number;
  pageContentRowsGap?: number;
  pageContentColumnsGap?: number;

  renderSignatureConfig?: IRenderSignatureConfig;
}

export const renderSignatures = async ({
  pdfDoc,

  acroformId,
  signatories,

  sealRenderPosition = DEFAULT_SEAL_SIZE,

  pageMargins = 10,
  pageContentGap = 10,
  pageContentRowsGap = pageContentGap,
  pageContentColumnsGap = pageContentGap,

  renderSignatureConfig,
}: IRenderSignaturesOptions) => {
  const fonts = await loadSignatureFonts(pdfDoc);

  const { withPosition, withoutPosition } = signatories.reduce(
    (acc, signatory) => {
      if (
        isObjectAttributesDefined(
          signatory.signatureRenderPosition,
          SignatureRenderPositionRequiredAttributes
        )
      ) {
        acc.withPosition.push(signatory);
        return acc;
      }

      acc.withoutPosition.push(signatory);
      return acc;
    },
    { withPosition: [], withoutPosition: [] } as {
      withPosition: Signatory[];
      withoutPosition: Signatory[];
    }
  );

  const renderConfig = PDFSignature.processRenderConfig({
    fonts,
    ...(renderSignatureConfig ? renderSignatureConfig : {}),
  });

  if (withPosition.length > 0) {
    renderSignaturesWithPosition({
      pdfDoc,
      renderConfig,
      signatories: withPosition,
    });
  }

  const pageConfig: IPageConfig = {
    margins: pageMargins,

    contentGap: pageContentGap,
    contentRowsGap: pageContentRowsGap,
    contentColumnsGap: pageContentColumnsGap,
  };

  let signaturesWithoutPosition: IRenderSignaturesWithoutPositionResult = {
    signaturesPage: undefined,
    pageConfig,
    signaturesRowHeight: 0,
    pdfSignatures: [],
  };

  if (withoutPosition.length > 0) {
    signaturesWithoutPosition = renderSignaturesWithoutPosition({
      pdfDoc,
      pageConfig,
      renderConfig,
      signatories: withoutPosition,
    });
  }

  renderSignaturesSeal({
    pdfDoc,

    acroformId,
    sealRenderPosition,

    signaturesWithoutPosition,

    fonts,
  });

  return pdfDoc;
};

export default renderSignatures;
