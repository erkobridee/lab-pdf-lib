const { PDFDocument } = require("pdf-lib");

const { loadPdfFile, writePdfFile } = require("./helpers/fs");

const { addPageTextCenterToPdf } = require("./addPageTextCenterToPdf");
const { addSingleSignatoryToPdf } = require("./addSingleSignatoryToPdf");
const { addSomeSignatoriesToPdf } = require("./addSomeSignatoriesToPdf");

const {
  addSignatoriesToPdf: addSignatoriesToPdfV1,
} = require("./addSignatoriesToPdfV1");

const {
  addSignatoriesToPdf: addSignatoriesToPdfV2,
} = require("./addSignatoriesToPdfV2");

const {
  addSigWidgetPlaceholderToPdf,
} = require("./addSigWidgetPlaceholderToPdf");

(async () => {
  const pdfInputFile = loadPdfFile();

  let pdfDoc = await PDFDocument.load(pdfInputFile, {
    ignoreEncryption: true,
  });

  pdfDoc = await addSigWidgetPlaceholderToPdf(pdfDoc); // adds on the first page
  pdfDoc = await addPageTextCenterToPdf(pdfDoc);
  pdfDoc = await addSingleSignatoryToPdf(pdfDoc);
  pdfDoc = await addSomeSignatoriesToPdf(pdfDoc, 2, false);
  pdfDoc = await addSignatoriesToPdfV1(pdfDoc, false);
  pdfDoc = await addSignatoriesToPdfV2(pdfDoc, true);

  const pdfDocBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfContentResult = Buffer.from(pdfDocBytes);

  writePdfFile(pdfContentResult);
})();
