import type { PDFDocument } from "pdf-lib";

import type { ISignatureRenderPosition } from "@/entities";

import { ISignatureFonts } from "@/pdflibUtils";

//---//

import {
  getSafePdfPage,
  getPDFCoordsInsideRectangle,
  getPDFCoordsFromPage,
  addSealSignaturesWidgetPlaceholder,
} from "@/pdflibUtils";

//----------------------------------------------------------------------------//

interface ISealPositionFixedOptions {
  pdfDoc: PDFDocument;
  acroformId: string;
  fonts: ISignatureFonts;
  renderPosition: ISignatureRenderPosition;
}

export const sealPositionFixed = ({
  pdfDoc,
  acroformId,
  fonts,
  renderPosition,
}: ISealPositionFixedOptions) => {
  const { page, x, y, width, height, scale = 1 } = renderPosition;

  const pdfPage = getSafePdfPage(pdfDoc, page);
  const rectangle = getPDFCoordsInsideRectangle({
    x,
    y,
    width: width * scale,
    height: height * scale,
    rectangle: getPDFCoordsFromPage({ pdfPage }),
  });

  addSealSignaturesWidgetPlaceholder({
    acroformId,
    pdfDoc,
    pdfPage,
    rectangle,
    fonts,
  });
};

export default sealPositionFixed;
