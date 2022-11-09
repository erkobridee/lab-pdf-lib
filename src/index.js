const { PDFDocument } = require("pdf-lib");

const { loadPdfFile, writePdfFile } = require("./fsHelper");

const { addTextToPdf } = require("./addTextToPdf");
const { addPageToPdf } = require("./addPageToPdf");
const {
  addSigWidgetPlaceholderToPdf,
} = require("./addSigWidgetPlaceholderToPdf");

(async () => {
  const pdfInputFile = loadPdfFile();

  let pdfDoc = await PDFDocument.load(pdfInputFile, {
    ignoreEncryption: true,
  });

  pdfDoc = await addPageToPdf(pdfDoc);
  pdfDoc = await addTextToPdf(pdfDoc);
  pdfDoc = await addSigWidgetPlaceholderToPdf(pdfDoc);

  const pdfDocBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfContentResult = Buffer.from(pdfDocBytes);

  writePdfFile(pdfContentResult);
})();
