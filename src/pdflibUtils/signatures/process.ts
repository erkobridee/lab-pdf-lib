import { ISignatureRenderPosition, Signatory } from "@/entities";

import { TRawPdf, loadPdfFrom, savePdf } from "@/pdflibUtils/pdfFile";

import { renderSignatures } from "./render";

interface IProcessSignaturesOptions {
  rawPdf: TRawPdf;
  /** it's the signatures request id value */
  acroformId: string;
  signatories: Signatory[];
  sealRenderPosition?: ISignatureRenderPosition;
  saveAsBase64?: boolean;
}

export const processSignatures = async ({
  rawPdf,
  acroformId,
  signatories,
  sealRenderPosition,
  saveAsBase64 = false,
}: IProcessSignaturesOptions) => {
  let pdfDoc = await loadPdfFrom(rawPdf);

  pdfDoc = await renderSignatures({
    pdfDoc,
    acroformId,
    signatories,
    sealRenderPosition,

    renderSignatureConfig: {
      displayLocation: false,
    },
  });

  return await savePdf({ pdfDoc, saveAsBase64 });
};

export default processSignatures;
