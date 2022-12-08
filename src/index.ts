import { generateSignatories, buildSignatory } from "@/entities";

import { uuid } from "@/utils/data/id";
import { loadPdfFile, writePdfFile } from "@/utils/pdf";

import { processSignatures, debugSet } from "@/pdflibUtils";

//----------------------------------------------------------------------------//

debugSet(["rendeSealRectangle"]);

//----------------------------------------------------------------------------//

const signatoriesWithoutPosition = async () => {
  const signatories = generateSignatories();

  let pdfFileBuffer = loadPdfFile();

  pdfFileBuffer = (await processSignatures({
    rawPdf: pdfFileBuffer,
    acroformId: uuid(),
    signatories,
    saveAsBase64: false,
  })) as Buffer;

  writePdfFile(pdfFileBuffer, "result_v2_dynamic_positions");
};

//----------------------------------------------------------------------------//

/** generate signatories with and without defined position */
const signatoriesMixed = async () => {
  let signatories = generateSignatories(3, 5);

  const signatory1 = buildSignatory();

  // TODO: define the signatory2.signatureRenderPosition

  const signatory2 = buildSignatory();

  // TODO: define the signatory2.signatureRenderPosition

  signatories = [signatory1, ...signatories, signatory2];

  let pdfFileBuffer = loadPdfFile();

  pdfFileBuffer = (await processSignatures({
    rawPdf: pdfFileBuffer,
    acroformId: uuid(),
    signatories,
    saveAsBase64: false,
  })) as Buffer;

  writePdfFile(pdfFileBuffer, "result_v2_mixed");
};

//----------------------------------------------------------------------------//

(async () => {
  await signatoriesWithoutPosition();
  await signatoriesMixed();
})();
