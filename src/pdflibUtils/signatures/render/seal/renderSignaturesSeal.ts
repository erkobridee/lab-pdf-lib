import type { PDFDocument } from "pdf-lib";

import type { ISignatureRenderPosition } from "@/entities";

import type { IRenderSignaturesWithoutPositionResult } from "@/pdflibUtils/signatures/render/renderSignaturesWithoutPosition";
import { ISignatureFonts } from "@/pdflibUtils";

//---//

import { SignatureRenderPositionRequiredAttributes } from "@/entities";

import { isObjectAttributesDefined } from "@/utils/data";

import { ISealSize, TSealRenderPosition } from "./definitions";
import { sealPositionFixed } from "./sealPositionFixed";
import { sealPositionDynamic } from "./sealPositionDynamic";

//----------------------------------------------------------------------------//

interface IRenderSignaturesSealOptions {
  pdfDoc: PDFDocument;

  acroformId: string;
  sealRenderPosition: TSealRenderPosition;

  signaturesWithoutPosition: IRenderSignaturesWithoutPositionResult;

  fonts: ISignatureFonts;
}

export const renderSignaturesSeal = ({
  pdfDoc,

  acroformId,
  sealRenderPosition,

  signaturesWithoutPosition,

  fonts,
}: IRenderSignaturesSealOptions) => {
  if (acroformId === "") return false;

  if (
    isObjectAttributesDefined(
      sealRenderPosition,
      SignatureRenderPositionRequiredAttributes
    )
  ) {
    const renderPosition = sealRenderPosition as ISignatureRenderPosition;
    sealPositionFixed({ pdfDoc, renderPosition, acroformId, fonts });

    return true;
  }

  const sealSize = sealRenderPosition as ISealSize;
  sealPositionDynamic({
    pdfDoc,

    acroformId,
    sealSize,

    signaturesWithoutPosition,

    fonts,
  });

  return true;
};

export default renderSignaturesSeal;
