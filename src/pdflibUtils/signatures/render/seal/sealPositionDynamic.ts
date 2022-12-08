import { addSealSignaturesWidgetPlaceholder } from "@/pdflibUtils/signatures/helpers";

import {
  ISealCalculatePositionOptions,
  sealCalculatePosition,
} from "./sealCalculatePosition";

//----------------------------------------------------------------------------//

interface ISealPositionDynamicOptions extends ISealCalculatePositionOptions {
  acroformId: string;
}

export const sealPositionDynamic = ({
  pdfDoc,
  acroformId,

  sealSize,
  signaturesWithoutPosition,
}: ISealPositionDynamicOptions) => {
  const { pdfPage, x, y, width, height } = sealCalculatePosition({
    pdfDoc,
    sealSize,
    signaturesWithoutPosition,
  });

  addSealSignaturesWidgetPlaceholder({
    pdfDoc,
    pdfPage,
    acroformId,
    rectangle: { x, y, width, height },
  });
};

export default sealPositionDynamic;
