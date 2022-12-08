import type { ISignatureFonts } from "@/pdflibUtils/signatures/helpers";

//---===---//

import { addSealSignaturesWidgetPlaceholder } from "@/pdflibUtils/signatures/helpers";

import {
  ISealCalculatePositionOptions,
  sealCalculatePosition,
} from "./sealCalculatePosition";

//----------------------------------------------------------------------------//

interface ISealPositionDynamicOptions extends ISealCalculatePositionOptions {
  acroformId: string;

  fonts: ISignatureFonts;
}

export const sealPositionDynamic = ({
  pdfDoc,
  acroformId,

  fonts,

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
    fonts,
  });
};

export default sealPositionDynamic;