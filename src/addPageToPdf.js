const { StandardFonts } = require("pdf-lib");

/*
  pdf-lib PageSizes
  https://pdf-lib.js.org/docs/api/index#const-pagesizes
  https://github.com/Hopding/pdf-lib/blob/a082a8518c978fe73a8de5682c1fc9a75f744aae/src/api/sizes.ts#L1
*/

const addPageToPdf = async (pdfDoc) => {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const currentLastIndex = pdfDoc.getPageCount() - 1;
  const currentLastPage = pdfDoc.getPage(currentLastIndex);
  const { width, height } = currentLastPage.getSize();

  // console.log("addPageToPdf > current last page size: ", { width, height });

  const page = pdfDoc.addPage([width, height]);

  const text = "This text is centered.";
  const textSize = 24;
  const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
  const textHeight = helveticaFont.heightAtSize(textSize);

  page.drawText(text, {
    x: width / 2 - textWidth / 2,
    y: height / 2 - textHeight / 2,
    size: textSize,
    font: helveticaFont,
  });

  return pdfDoc;
};

module.exports = { addPageToPdf };
