const { PDFDocument } = require("pdf-lib");

const { loadPdfFile, writePdfFile } = require("./helpers/fs");

const { addPageTextCenterToPdf } = require("./addPageTextCenterToPdf");
const { addSingleSignatoryToPdf } = require("./addSingleSignatoryToPdf");
const {
  addTwoOrFiveSignatoriesToPdf,
} = require("./addTwoOrFiveSignatoriesToPdf");
const { addSignatoriesToPdf } = require("./addSignatoriesToPdf");
const {
  addSigWidgetPlaceholderToPdf,
} = require("./addSigWidgetPlaceholderToPdf");

(async () => {
  const pdfInputFile = loadPdfFile();

  let pdfDoc = await PDFDocument.load(pdfInputFile, {
    ignoreEncryption: true,
  });

  pdfDoc = await addPageTextCenterToPdf(pdfDoc);
  pdfDoc = await addSingleSignatoryToPdf(pdfDoc);
  pdfDoc = await addTwoOrFiveSignatoriesToPdf(pdfDoc, 2, true);
  pdfDoc = await addSignatoriesToPdf(pdfDoc, false);
  pdfDoc = await addSigWidgetPlaceholderToPdf(pdfDoc);

  const pdfDocBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfContentResult = Buffer.from(pdfDocBytes);

  writePdfFile(pdfContentResult);
})();
