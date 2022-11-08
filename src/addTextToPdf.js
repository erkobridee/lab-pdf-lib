const { StandardFonts, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const { loadFontFile } = require("./fsHelper");

//----------------------------------------------------------------------------//

const PDF_RGB_BLACK = rgb(0, 0, 0);

const PADDING = 5;
const fontSizeText = 24;
const fontSizeInfo = 8;

//----------------------------------------------------------------------------//

const addTextToPdf = async (pdfDoc) => {
  const today = new Date();

  //--------------------------------------------------------------------------//

  // const pages = pdfDoc.getPages();
  // const pagesLength = pages.length;
  // const lastPageIndex = pagesLength - 1;
  // const pdfPage = pages[lastPageIndex];
  // const pdfPageHeight = pdfPage.getHeight();

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
    y = 10,
    borderWidth = 0;

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

    color: PDF_RGB_BLACK,
    borderWidth,

    opacity: 0.05,
    borderOpacity: 1,
  };

  pdfPage.drawRectangle(rectangleOptions);

  //--------------------------------------------------------------------------//

  const textOptions = {
    x: textXPosition,
    y:
      baseYPosition +
      PADDING +
      infoHeightAtDesiredFontSize +
      PADDING +
      2 +
      (extraText ? infoHeightAtDesiredFontSize + PADDING : 0),
    size: fontSizeText,
    font: fontText,
    color: PDF_RGB_BLACK,
  };

  pdfPage.drawText(text, textOptions);

  //--------------------------------------------------------------------------//

  const dateOptions = {
    x: textXPosition,
    y:
      baseYPosition +
      PADDING +
      (extraText ? infoHeightAtDesiredFontSize + PADDING : 0),
    size: fontSizeInfo,
    font: fontInfo,
    color: PDF_RGB_BLACK,
  };

  const dateText = `date: ${today.toISOString()}`;

  pdfPage.drawText(dateText, dateOptions);

  //--------------------------------------------------------------------------//

  if (extraText) {
    const extraTextOptions = {
      x: textXPosition,
      y: baseYPosition + PADDING,
      size: fontSizeInfo,
      font: fontInfo,
      color: PDF_RGB_BLACK,
    };

    pdfPage.drawText(extraText, extraTextOptions);
  }

  //--------------------------------------------------------------------------//

  return pdfDoc;
};

module.exports = {
  addTextToPdf,
};
