const { roundUp, roundDown } = require("./helpers/math");
const {
  COLOR,
  loadPdfFonts,
  getPDFCoordsLimits,
  getPDFCoordsFromPage,
  getPDFCoordsInsideRectangle,
  getTopBottomLeftRightValues,
} = require("./helpers/pdf");
const { generateSignatories } = require("./helpers/signatories");

//----------------------------------------------------------------------------//

let DEBUG = false;

const MARGIN = 10;
const GAP = MARGIN;
const PADDING = 5;

const PDF_RGB_MARGIN = COLOR.AIR_FORCE_BLUE;
// const PDF_RGB_CENTRAL_VERTICAL_LINE = COLOR.NAVAJO_WHITE;
const PDF_RGB_SIGNATORY_BG = COLOR.GHOST_WHITE;
const PDF_RGB_SIGNATORY_COLOR = COLOR.BLACK;
// const PDF_RGB_SEAL = COLOR.GAINSBORO;

//----------------------------------------------------------------------------//

const drawMargins = ({ pdfPage, pageContentRectangle }) => {
  // https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawrectangleoptions
  const rectangleOptions = {
    ...pageContentRectangle,

    borderColor: PDF_RGB_MARGIN,
    borderWidth: 1,
  };

  pdfPage.drawRectangle(rectangleOptions);
};

// https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawlineoptions
const drawLines = ({
  pdfPage,
  pageContentCoordsLimits,
  pageContentRectangle,
}) => {
  const { xLeft, xRight, yTop, yBottom } = pageContentCoordsLimits;

  //---===---//
  // vertical lines

  const x = pageContentRectangle.width / 2 + MARGIN;
  pdfPage.drawLine({
    thickness: 1,
    color: COLOR.RED,
    end: { x, y: yTop },
    start: { x, y: yBottom },
  });

  //---===---//
  // horizontal lines

  let yLine = yTop - 1;
  pdfPage.drawLine({
    thickness: 1,
    color: COLOR.BLUE,
    start: { x: xLeft, y: yLine },
    end: { x: xRight / 2 + MARGIN / 2, y: yLine },
  });

  yLine = yTop + 1;
  pdfPage.drawLine({
    thickness: 1,
    color: COLOR.BLUE,
    start: { x: xRight / 2 + MARGIN / 2, y: yLine },
    end: { x: xRight, y: yLine },
  });
};

//----------------------------------------------------------------------------//

const renderSignatory = ({
  pdfPage,
  pageContentRectangle,

  padding,
  textGap,

  signatory,

  fontText,
  fontInfo,

  fontSizeText,
  fontSizeInfo,

  borderColor = COLOR.AIR_FORCE_BLUE,
  bgColor = COLOR.GHOST_WHITE,
  textColor = COLOR.BLACK,
}) => {
  const { x, y, width, height, name, uuid, shortId } = signatory;

  const signatorySignatoryBGRectangle = getPDFCoordsInsideRectangle({
    x,
    y,
    width,
    height,
    rectangle: pageContentRectangle,
  });

  pdfPage.drawRectangle({
    ...signatorySignatoryBGRectangle,
    color: bgColor,

    ...(DEBUG
      ? {
          borderColor: borderColor,
          borderWidth: 1,
        }
      : {}),
  });

  padding = getTopBottomLeftRightValues(padding);

  const signatorySignatoryContentRectangle = getPDFCoordsInsideRectangle({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    rectangle: signatorySignatoryBGRectangle,
    rectanglePaddings: padding,
  });

  DEBUG &&
    pdfPage.drawRectangle({
      ...signatorySignatoryContentRectangle,
      color: bgColor,

      borderColor: borderColor,
      borderWidth: 1,
    });

  let textTop = textGap;

  pdfPage.drawText(name, {
    color: textColor,
    size: fontSizeText,
    font: fontText,
    ...getPDFCoordsInsideRectangle({
      rectangle: signatorySignatoryContentRectangle,
      top: textTop,
      height: fontSizeText - textGap,
    }),
  });

  const baseInfoText = {
    color: textColor,
    size: fontSizeInfo,
    font: fontInfo,
  };

  textTop += fontSizeText + textGap;
  pdfPage.drawText(`uuid: ${uuid}`, {
    ...baseInfoText,
    ...getPDFCoordsInsideRectangle({
      rectangle: signatorySignatoryContentRectangle,
      height: fontSizeInfo,
      top: textTop,
    }),
  });

  textTop += fontSizeInfo + textGap;
  pdfPage.drawText(`shortId: ${shortId}`, {
    ...baseInfoText,
    ...getPDFCoordsInsideRectangle({
      rectangle: signatorySignatoryContentRectangle,
      height: fontSizeInfo,
      top: textTop,
    }),
  });
};

const renderSignatories = ({
  pdfPage,
  pageContentRectangle,
  pageContentCoordsLimits,
  pdfFonts,

  gap = GAP,
  padding = PADDING,
  textGap = PADDING,

  borderColor = COLOR.AIR_FORCE_BLUE,
  bgColor = COLOR.GHOST_WHITE,
  textColor = COLOR.BLACK,
}) => {
  const signatories = generateSignatories(2, 10);

  padding = getTopBottomLeftRightValues(padding);

  const {
    fontText,
    fontInfo,

    fontSizeText,
    fontSizeInfo,

    textHeightAtDesiredFontSize,
    infoHeightAtDesiredFontSize,
  } = pdfFonts;

  const signatoryNameHeight = textHeightAtDesiredFontSize;
  const signatoryUuidHeight = infoHeightAtDesiredFontSize;
  const signatoryShortIdHeight = infoHeightAtDesiredFontSize;
  const signatoryTotalHeight =
    padding.top +
    signatoryNameHeight +
    textGap +
    signatoryUuidHeight +
    textGap +
    signatoryShortIdHeight +
    padding.bottom;

  const availableHeight =
    pageContentCoordsLimits.yTop - pageContentCoordsLimits.yBottom;

  const availableWidth = pageContentRectangle.width;
  const halfAvailableWidth = availableWidth / 2;

  const toAdjustWidth = gap > 0 ? gap / 2 : 0;
  const maxSignatureAvailableWidth = halfAvailableWidth - toAdjustWidth;

  const rowHeight = signatoryTotalHeight + gap;
  const maxRowsCount = roundDown(availableHeight / rowHeight);

  let row = 0,
    x = 0;
  const signatoriesComputed = signatories.map(({ name, uuid, shortId }) => {
    const nameWidth =
      roundUp(fontText.widthOfTextAtSize(name, fontSizeText)) + fontSizeText;

    let largestWidth = nameWidth;

    const uuidWidth = roundUp(fontInfo.widthOfTextAtSize(uuid, fontSizeInfo));

    if (uuidWidth > largestWidth) largestWidth = uuidWidth;

    const shortIdWidth = roundUp(
      fontInfo.widthOfTextAtSize(shortId, fontSizeInfo)
    );

    if (shortIdWidth > largestWidth) largestWidth = shortIdWidth;

    const totalWidth = padding.left + largestWidth + padding.right;
    const width =
      totalWidth < maxSignatureAvailableWidth
        ? maxSignatureAvailableWidth
        : totalWidth;

    if (x + width > availableWidth) {
      row++;
      x = 0;
    }

    const y = rowHeight * row;

    const computed = {
      name,
      uuid,
      shortId,
      width,
      height: signatoryTotalHeight,
      x,
      y,
      ...(DEBUG ? { nameWidth, uuidWidth, shortIdWidth, totalWidth } : {}),
    };

    renderSignatory({
      pdfPage,
      pageContentRectangle,

      signatory: computed,

      padding,
      textGap,

      fontText,
      fontInfo,

      fontSizeText,
      fontSizeInfo,

      borderColor,
      bgColor,
      textColor,
    });

    if (width > maxSignatureAvailableWidth) {
      row++;
      x = 0;
    } else {
      const extra = gap > 0 ? gap / 2 : 0;
      x += halfAvailableWidth + extra;
    }

    return computed;
  });

  DEBUG &&
    console.log("addTwoOrFiveSignatoriesToPdf > renderSignatories: ", {
      signatoriesComputed,
      signatoryNameHeight,
      signatoryUuidHeight,
      signatoryShortIdHeight,
      signatoryTotalHeight,
      pageContentRectangle,
      pageContentCoordsLimits,
      availableHeight,
      availableWidth,
      halfAvailableWidth,
      maxSignatureAvailableWidth,
      rowHeight,
      maxRowsCount,
    });
};

//----------------------------------------------------------------------------//

const addSomeSignatoriesToPdf = async (pdfDoc, onPage = 2, debug = false) => {
  DEBUG = debug;

  onPage = onPage - 1;
  if (onPage < 0) onPage = 0;

  const pdfPage = pdfDoc.getPage(onPage);

  const pageContentRectangle = getPDFCoordsFromPage({
    margins: MARGIN,
    pdfPage,
  });
  const pageContentCoordsLimits = getPDFCoordsLimits({
    rectangle: pageContentRectangle,
  });

  //---===---//

  const pdfFonts = await loadPdfFonts(pdfDoc);

  renderSignatories({
    pdfPage,
    pageContentRectangle,
    pageContentCoordsLimits,
    pdfFonts,
  });

  if (DEBUG) {
    drawMargins({ pdfPage, pageContentRectangle });
    drawLines({ pdfPage, pageContentCoordsLimits, pageContentRectangle });
  }

  return pdfDoc;
};

module.exports = {
  addSomeSignatoriesToPdf,
};
