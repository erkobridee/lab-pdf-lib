const { PDFDocument } = require("pdf-lib");

const { loadPdfFile, writePdfFile } = require("./helpers/fs");

const { addPageTextCenterToPdf } = require("./addPageTextCenterToPdf");
const { addSingleSignatoryToPdf } = require("./addSingleSignatoryToPdf");
const { addSomeSignatoriesToPdf } = require("./addSomeSignatoriesToPdf");
const { addSignatoriesToPdf } = require("./addSignatoriesToPdf");

const {
  addSigWidgetPlaceholderToPdf,
} = require("./addSigWidgetPlaceholderToPdf");

const DEBUG = false;

(async () => {
  const pdfInputFile = loadPdfFile();

  let pdfDoc = await PDFDocument.load(pdfInputFile, {
    ignoreEncryption: true,
  });

  pdfDoc = await addSigWidgetPlaceholderToPdf(pdfDoc); // adds on the first page

  if (DEBUG) {
    pdfDoc = await addPageTextCenterToPdf(pdfDoc);
    pdfDoc = await addSingleSignatoryToPdf(pdfDoc);
    pdfDoc = await addSomeSignatoriesToPdf(pdfDoc, 2, DEBUG);
  }

  pdfDoc = await addSignatoriesToPdf(pdfDoc, DEBUG);

  const pdfDocBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfContentResult = Buffer.from(pdfDocBytes);

  writePdfFile(pdfContentResult);
})();
