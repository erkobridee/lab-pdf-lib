import { generateSignatories } from "@/entities";

import { uuid } from "@/utils/data/id";
import { loadPdfFile, writePdfFile } from "@/utils/pdf";

import { processSignatures, debugSet } from "@/pdflibUtils";

let pdfFileBuffer = loadPdfFile();

const signaturesWithoutPosition = async () => {
  const signatories = generateSignatories();

  debugSet(["rendeSealRectangle"]);

  pdfFileBuffer = (await processSignatures({
    rawPdf: pdfFileBuffer,
    acroformId: uuid(),
    signatories,
    saveAsBase64: false,
  })) as Buffer;

  writePdfFile(pdfFileBuffer, "result_v2_dynamic_positions");
};

(async () => {
  await signaturesWithoutPosition();
})();
