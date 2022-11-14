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
const PDF_RGB_CENTRAL_VERTICAL_LINE = COLOR.NAVAJO_WHITE;
const PDF_RGB_SIGNATORY_BG = COLOR.GHOST_WHITE;
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

  let yLine = yTop - 160;
  pdfPage.drawLine({
    thickness: 1,
    color: COLOR.BLUE,
    start: { x: xLeft, y: yLine },
    end: { x: xRight / 2 + MARGIN / 2, y: yLine },
  });

  yLine = yTop - 165;
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

  signatory,

  // fontText,
  // fontInfo,

  // fontSizeText,
  // fontSizeInfo,
}) => {
  const { x, y, width, height } = signatory;

  const signatorySignatoryBGRectangle = getPDFCoordsInsideRectangle({
    x,
    y,
    width,
    height,
    rectangle: pageContentRectangle,
  });

  pdfPage.drawRectangle({
    ...signatorySignatoryBGRectangle,
    color: PDF_RGB_SIGNATORY_BG,

    borderColor: PDF_RGB_MARGIN,
    borderWidth: 1,
  });

  padding = getTopBottomLeftRightValues(padding);

  // TODO: define the text rendering
};

const renderSignatories = ({
  pdfPage,
  pageContentRectangle,
  pageContentCoordsLimits,
  pdfFonts,

  gap = GAP,
  padding = PADDING,
  textGap = PADDING,
}) => {
  // const signatories = generateSignatories(2, 5, 1);
  const signatories = generateSignatories(5, 8, 1);

  // DEBUG &&
  //   console.log("addTwoOrFiveSignatoriesToPdf > renderSignatories: ", {
  //     signatories,
  //   });

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
    const nameWidth = roundUp(fontText.widthOfTextAtSize(name, fontSizeText));

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
      meta: JSON.stringify({
        nameWidth,
        uuidWidth,
        shortIdWidth,
        totalWidth,
      }),
      name,
      uuid,
      shortId,
      width,
      height: signatoryTotalHeight,
      x,
      y,
    };

    renderSignatory({
      pdfPage,
      pageContentRectangle,

      signatory: computed,

      padding,

      fontText,
      fontInfo,

      fontSizeText,
      fontSizeInfo,
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

const addTwoOrFiveSignatoriesToPdf = async (
  pdfDoc,
  onPage = 2,
  debug = false
) => {
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

  drawMargins({ pdfPage, pageContentRectangle });
  renderSignatories({
    pdfPage,
    pageContentRectangle,
    pageContentCoordsLimits,
    pdfFonts,
  });
  drawLines({ pdfPage, pageContentCoordsLimits, pageContentRectangle });

  return pdfDoc;
};

module.exports = {
  addTwoOrFiveSignatoriesToPdf,
};
