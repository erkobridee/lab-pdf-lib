const { StandardFonts } = require("pdf-lib");

const {
  COLOR,
  getPDFCoordsFromPage,
  getPDFCoordsInsideRectangle,
} = require("./helpers/pdf");

/*
  pdf-lib PageSizes
  https://pdf-lib.js.org/docs/api/index#const-pagesizes
  https://github.com/Hopding/pdf-lib/blob/a082a8518c978fe73a8de5682c1fc9a75f744aae/src/api/sizes.ts#L1
*/

const addPageTextCenterToPdf = async (pdfDoc) => {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const currentLastIndex = pdfDoc.getPageCount() - 1;
  const currentLastPage = pdfDoc.getPage(currentLastIndex);
  const { width, height } = currentLastPage.getSize();

  // console.log("addPageToPdf > current last page size: ", { width, height });

  const pdfPage = pdfDoc.addPage([width, height]);

  const text = "This text is centered.";
  const textSize = 24;
  const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
  const textHeight = helveticaFont.heightAtSize(textSize);

  pdfPage.drawText(text, {
    x: width / 2 - textWidth / 2,
    y: height / 2 - textHeight / 2,
    size: textSize,
    font: helveticaFont,
  });

  //---===---//

  const outerRectangleOptions = {
    color: COLOR.AIR_FORCE_BLUE,
    ...getPDFCoordsFromPage({
      x: 50,
      y: 200,
      width: 150,
      height: 100,
      pdfPage,
    }),
  };
  pdfPage.drawRectangle(outerRectangleOptions);

  const innerRectangleOptions = {
    color: COLOR.NAVAJO_WHITE,
    ...getPDFCoordsInsideRectangle({
      rectangle: outerRectangleOptions,
      retanglePaddings: 5,
      width: 60,
      right: 0,
      bottom: 0,
    }),
  };
  pdfPage.drawRectangle(innerRectangleOptions);

  return pdfDoc;
};

module.exports = { addPageTextCenterToPdf };
