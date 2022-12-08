import { generateSignatories } from "@/entities";

import { uuid } from "@/utils/data/id";
import { loadPdfFile, writePdfFile } from "@/utils/pdf";

import { processSignatures, debugAll } from "@/pdflibUtils";

(async () => {
  const signatories = generateSignatories();

  let pdfFileBuffer = loadPdfFile();

  debugAll();

  pdfFileBuffer = (await processSignatures({
    rawPdf: pdfFileBuffer,
    acroformId: uuid(),
    signatories,
    saveAsBase64: false,
  })) as Buffer;

  writePdfFile(pdfFileBuffer, "result_v2");
})();
