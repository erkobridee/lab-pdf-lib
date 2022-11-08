const { PDFDocument } = require("pdf-lib");

const { loadPdfFile, writePdfFile } = require("./fsHelper");

const { addTextToPdf } = require("./addTextToPdf");
const { addPageToPdf } = require("./addPageToPdf");
const {
  addSignaturePlaceholderToPdf,
} = require("./addSignaturePlaceholderToPdf");

(async () => {
  const pdfInputFile = loadPdfFile();

  let pdfDoc = await PDFDocument.load(pdfInputFile, {
    ignoreEncryption: true,
  });

  pdfDoc = await addPageToPdf(pdfDoc);
  pdfDoc = await addTextToPdf(pdfDoc);
  pdfDoc = await addSignaturePlaceholderToPdf(pdfDoc);

  const pdfDocBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfContentResult = Buffer.from(pdfDocBytes);

  writePdfFile(pdfContentResult);
})();
