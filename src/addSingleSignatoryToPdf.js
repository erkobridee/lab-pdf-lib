const { StandardFonts } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const { loadFontFile } = require("./helpers/fs");
const { COLOR } = require("./helpers/pdf");

//----------------------------------------------------------------------------//

const PADDING = 5;
const fontSizeText = 20;
const fontSizeInfo = 8;

//----------------------------------------------------------------------------//

const addSingleSignatoryToPdf = async (pdfDoc) => {
  const today = new Date();

  //--------------------------------------------------------------------------//

  const pagesLength = pdfDoc.getPageCount();
  const lastPageIndex = pagesLength - 1;
  const pdfPage = pdfDoc.getPage(lastPageIndex);
  const pdfPageHeight = pdfPage.getHeight();

  //--------------------------------------------------------------------------//

  const text = "Erko Bridee de Almeida Cabrera";
  const extraText = "location info";

  //--------------------------------------------------------------------------//

  const fontBuffer = loadFontFile();

  let fontText;
  if (fontBuffer) {
    pdfDoc.registerFontkit(fontkit);
    fontText = await pdfDoc.embedFont(fontBuffer);
  } else {
    fontText = await pdfDoc.embedFont(StandardFonts.CourierOblique);
  }
  const fontInfo = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const textHeightAtDesiredFontSize = fontText.heightAtSize(fontSizeText);
  const textWidthAtDesiredHeight = fontText.widthOfTextAtSize(
    text,
    fontSizeText
  );
  const infoHeightAtDesiredFontSize = fontInfo.heightAtSize(fontSizeInfo);

  //--------------------------------------------------------------------------//

  const x = 10,
    y = 10;

  //--------------------------------------------------------------------------//

  const rectangleHeight =
    PADDING +
    PADDING +
    textHeightAtDesiredFontSize +
    (extraText
      ? infoHeightAtDesiredFontSize + infoHeightAtDesiredFontSize
      : infoHeightAtDesiredFontSize);

  const baseYPosition = pdfPageHeight - (y + rectangleHeight);

  const baseXPosition = x + PADDING;
  const textXPosition = baseXPosition + PADDING;

  const rectangleOptions = {
    x: baseXPosition,
    y: baseYPosition,
    width:
      (textWidthAtDesiredHeight > textHeightAtDesiredFontSize
        ? textWidthAtDesiredHeight + PADDING
        : textHeightAtDesiredFontSize) +
      2 * PADDING,
    height: rectangleHeight,

    color: COLOR.GHOST_WHITE,
  };

  pdfPage.drawRectangle(rectangleOptions);

  //--------------------------------------------------------------------------//

  /*
    since the pdf page coordinates are:
    x: 0 = left
    y: 0 = bottom left

    starts the text rendering from bottom to top, calculating the current y 
    position

    some extra useful reference about positioning on a pdf page
    https://github.com/Hopding/pdf-lib/issues/65#issuecomment-794934192
  */

  let currentY = baseYPosition + PADDING;

  if (extraText) {
    const extraTextOptions = {
      x: textXPosition,
      // y: baseYPosition + PADDING,
      y: currentY,
      size: fontSizeInfo,
      font: fontInfo,
      color: COLOR.BLACK,
    };

    pdfPage.drawText(extraText, extraTextOptions);
  }

  //--------------------------------------------------------------------------//

  currentY += extraText ? infoHeightAtDesiredFontSize + PADDING : 0;

  const dateOptions = {
    x: textXPosition,
    // y:
    //   baseYPosition +
    //   PADDING +
    //   (extraText ? infoHeightAtDesiredFontSize + PADDING : 0),
    y: currentY,
    size: fontSizeInfo,
    font: fontInfo,
    color: COLOR.BLACK,
  };

  const dateText = `date: ${today.toISOString()}`;

  pdfPage.drawText(dateText, dateOptions);

  //--------------------------------------------------------------------------//

  currentY += infoHeightAtDesiredFontSize + PADDING + 2;

  const textOptions = {
    x: textXPosition,
    // y:
    //   baseYPosition +
    //   PADDING +
    //   infoHeightAtDesiredFontSize +
    //   PADDING +
    //   2 +
    //   (extraText ? infoHeightAtDesiredFontSize + PADDING : 0),
    y: currentY,
    size: fontSizeText,
    font: fontText,
    color: COLOR.BLACK,
  };

  pdfPage.drawText(text, textOptions);

  //--------------------------------------------------------------------------//

  return pdfDoc;
};

module.exports = {
  addSingleSignatoryToPdf,
};
