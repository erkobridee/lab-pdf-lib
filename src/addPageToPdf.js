const { StandardFonts } = require("pdf-lib");

const addPageToPdf = async (pdfDoc) => {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage();

  const text = "This text is centered.";
  const textSize = 24;
  const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
  const textHeight = helveticaFont.heightAtSize(textSize);

  page.drawText(text, {
    x: page.getWidth() / 2 - textWidth / 2,
    y: page.getHeight() / 2 - textHeight / 2,
    size: textSize,
    font: helveticaFont,
  });

  return pdfDoc;
};

module.exports = { addPageToPdf };
