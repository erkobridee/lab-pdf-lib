const { generateSignatories } = require("./helpers/signatories");
const { roundUp, roundDown } = require("./helpers/math");
const {
  COLOR,
  loadPdfFonts,
  getPDFCoordsLimits,
  getPDFCoordsFromPage,
  getPDFCoordsInsideRectangle,
  getTopBottomLeftRightValues,
  addNewPdfPage,
  centralizeOnSize,
} = require("./helpers/pdf");
const { isUndefined } = require("./helpers/is");

//----------------------------------------------------------------------------//

let DEBUG = false;

//----------------------------------------------------------------------------//
// @begin: visual lines to help debug

// https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawrectangleoptions
const drawDebugMargins = ({
  pdfPage,
  pageContentRectangle,
  borderColor,
  borderWidth,
}) => {
  const rectangleOptions = {
    ...pageContentRectangle,

    borderColor,
    borderWidth,
  };

  pdfPage.drawRectangle(rectangleOptions);
};

// https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawlineoptions
const drawDebugLines = ({
  pdfPage,
  pageContentCoordsLimits,
  pageContentRectangle,

  margins = 10,

  thickness = 1,
  horizontalLineColor = COLOR.BLUE,
  verticalLineColor = COLOR.RED,
}) => {
  const { xLeft, xRight, yTop, yBottom } = pageContentCoordsLimits;

  margins = getTopBottomLeftRightValues(margins);

  const xMarginMiddleValue =
    Math.ceil(margins.left / 2) + Math.ceil(margins.right / 2);

  //---===---//
  // vertical lines

  const xMiddle = pageContentRectangle.width / 2 + xMarginMiddleValue;

  pdfPage.drawLine({
    thickness,
    color: verticalLineColor,
    end: { x: xMiddle, y: yTop },
    start: { x: xMiddle, y: yBottom },
  });

  //---===---//
  // horizontal lines

  const yLeftLine = yTop + 5;

  pdfPage.drawLine({
    thickness,
    color: horizontalLineColor,
    start: { x: xLeft, y: yLeftLine },
    end: { x: xMiddle, y: yLeftLine },
  });

  const yRightLine = yBottom - 5;

  pdfPage.drawLine({
    thickness,
    color: horizontalLineColor,
    start: { x: xMiddle, y: yRightLine },
    end: { x: xRight, y: yRightLine },
  });
};

/*  
  https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawlineoptions
*/
const drawDebugVisualLimits = ({
  pdfPage,

  pageContentCoordsLimits,
  pageContentRectangle,

  margins = 10,

  thickness = 1,
  marginLineColor = COLOR.PAYNE_GREY,
  horizontalLineColor = COLOR.BLUE,
  verticalLineColor = COLOR.RED,
}) => {
  if (!DEBUG) return;

  drawDebugMargins({
    pdfPage,
    pageContentRectangle,
    borderWidth: thickness,
    borderColor: marginLineColor,
  });

  drawDebugLines({
    pdfPage,
    pageContentCoordsLimits,
    pageContentRectangle,

    margins,

    thickness,
    horizontalLineColor,
    verticalLineColor,
  });
};

// @end: visual lines to help debug
//----------------------------------------------------------------------------//

const addNewPage = ({
  pdfDoc,
  pageSize,

  pageContentRectangle,
  pageContentCoordsLimits,

  margins = 10,
}) => {
  const pdfPage = addNewPdfPage({ pdfDoc, pageSize });

  if (isUndefined(pageSize)) {
    pageSize = pdfPage.getSize();
  }

  if (isUndefined(pageContentRectangle)) {
    pageContentRectangle = getPDFCoordsFromPage({
      margins,
      pdfPage,
    });
  }

  if (isUndefined(pageContentCoordsLimits)) {
    pageContentCoordsLimits = getPDFCoordsLimits({
      rectangle: pageContentRectangle,
    });
  }

  drawDebugVisualLimits({
    pdfPage,
    pageContentRectangle,
    pageContentCoordsLimits,
    margins,
  });

  return {
    pdfPage,
    pageSize,
    pageContentRectangle,
    pageContentCoordsLimits,
  };
};

//----------------------------------------------------------------------------//

const visualizeSignaturesSealPlaceholder = ({
  pdfPage,
  pdfFonts,
  sealRectangle,

  borderColor = COLOR.LIGHT_BROWN,
  bgColor = COLOR.FLORAL_WHITE,
  textColor = COLOR.BLACK,
}) => {
  pdfPage.drawRectangle({
    ...sealRectangle,
    color: bgColor,

    ...(DEBUG
      ? {
          borderColor,
          borderWidth: 1,
        }
      : {}),
  });

  const { fontInfo } = pdfFonts;
  const fontSize = 10;

  const infoHeightAtDesiredFontSize = roundUp(fontInfo.heightAtSize(fontSize));

  const textMessage = "Seal placeholder";
  const textMessageWidth = roundUp(
    fontInfo.widthOfTextAtSize(textMessage, fontSize)
  );
  const textMessageX = centralizeOnSize(sealRectangle.width, textMessageWidth);
  const textMessageY = centralizeOnSize(
    sealRectangle.height,
    infoHeightAtDesiredFontSize
  );

  pdfPage.drawText(textMessage, {
    color: textColor,
    size: fontSize,
    font: fontInfo,
    ...getPDFCoordsInsideRectangle({
      x: textMessageX,
      y: textMessageY,
      width: textMessageWidth,
      height: infoHeightAtDesiredFontSize,
      rectangle: sealRectangle,
    }),
  });
};

/**
 * checks the last computed signature position to check if there's enough space
 * to place the signatures seal placeholder on the same page, otherwise
 * it will add a new page to place it
 */
const addSignaturesSealPlaceholder = ({
  pdfDoc,
  pdfPage,
  pdfFonts,

  pageSize,
  pageContentRectangle,
  pageContentCoordsLimits,
  margins,

  signatoriesComputed,

  // used when needs to add the placeholder on a new page as top value
  rowHeight,

  width = 315,
  height = 140,
}) => {
  const signatoryComputed = signatoriesComputed[signatoriesComputed.length - 1];

  const signatoryComputedCoods = getPDFCoordsLimits({
    rectangle: signatoryComputed,
  });

  let sealX = pageContentCoordsLimits.xRight - width,
    sealY = pageContentCoordsLimits.yBottom,
    sealYTop = sealY + height;

  if (
    signatoryComputedCoods.xRight >= sealX &&
    sealYTop >= signatoryComputedCoods.yBottom
  ) {
    sealY = pageContentCoordsLimits.yTop - (rowHeight + height);
    sealX = centralizeOnSize(pageSize.width, width);

    pdfPage = addNewPage({
      pdfDoc,
      margins,
      pageSize,
      pageContentRectangle,
      pageContentCoordsLimits,
    }).pdfPage;
  }

  const sealRectangle = {
    x: sealX,
    y: sealY,
    width,
    height,
  };

  DEBUG &&
    console.log("addSignatoriesToPdf > addSignaturesSealPlaceholder: ", {
      signatoryComputed,
      signatoryComputedCoods,
      sealRectangle,
      sealYTop,
    });

  visualizeSignaturesSealPlaceholder({
    pdfPage,
    pdfFonts,
    sealRectangle,
  });
};

//----------------------------------------------------------------------------//

const renderSignatory = ({
  pdfPage,
  pageContentRectangle,
  pdfFonts,

  paddings,
  textGap,

  signatory,

  borderColor = COLOR.PASTEL_BLUE,
  bgColor = COLOR.WHITE_SMOKE,
  textColor = COLOR.BLACK,
}) => {
  const { x, y, width, height, name, uuid, shortId } = signatory;

  const {
    fontText,
    fontInfo,

    fontSizeText,
    fontSizeInfo,

    infoHeightAtDesiredFontSize,
  } = pdfFonts;

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

  paddings = getTopBottomLeftRightValues(paddings);

  const signatorySignatoryContentRectangle = getPDFCoordsInsideRectangle({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    rectangle: signatorySignatoryBGRectangle,
    rectanglePaddings: paddings,
  });

  let { x: textX, y: textY } = signatorySignatoryContentRectangle;
  signatory.x = textX;
  signatory.y = textY;

  const baseInfoText = {
    color: textColor,
    size: fontSizeInfo,
    font: fontInfo,
  };

  textY += textGap;

  pdfPage.drawText(`shortId: ${shortId}`, {
    ...baseInfoText,
    x: textX,
    y: textY,
  });

  textY += infoHeightAtDesiredFontSize + textGap;

  pdfPage.drawText(`uuid: ${uuid}`, {
    ...baseInfoText,
    x: textX,
    y: textY,
  });

  textY += infoHeightAtDesiredFontSize + textGap * 2;

  pdfPage.drawText(name, {
    color: textColor,
    size: fontSizeText,
    font: fontText,
    x: textX,
    y: textY,
  });

  DEBUG &&
    pdfPage.drawRectangle({
      ...signatorySignatoryContentRectangle,

      borderColor: borderColor,
      borderWidth: 1,
    });

  return signatorySignatoryContentRectangle;
};

const renderSignatories = ({
  pdfDoc,
  pdfFonts,

  signatories,

  margins = 10,
  paddings = 5,
  gap = 10,
  textGap = 5,

  borderColor = COLOR.SILVER,
  bgColor = COLOR.FAFAFA,
  textColor = COLOR.BLACK,
}) => {
  let { pdfPage, pageSize, pageContentRectangle, pageContentCoordsLimits } =
    addNewPage({ pdfDoc, margins });

  //--------------------------------------------------------------------------//
  // @begin: compute visual signature position

  paddings = getTopBottomLeftRightValues(paddings);

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
    paddings.top +
    signatoryNameHeight +
    textGap +
    signatoryUuidHeight +
    textGap +
    signatoryShortIdHeight +
    paddings.bottom;

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

    const totalWidth = paddings.left + largestWidth + paddings.right;
    const width =
      totalWidth < maxSignatureAvailableWidth
        ? maxSignatureAvailableWidth
        : totalWidth;

    if (x + width > availableWidth) {
      row++;
      x = 0;
    }

    if (row >= maxRowsCount) {
      row = 0;
      pdfPage = addNewPage({
        pdfDoc,
        margins,
        pageSize,
        pageContentRectangle,
        pageContentCoordsLimits,
      }).pdfPage;
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
      pdfFonts,

      signatory: computed,

      paddings,
      textGap,

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

  // @end: compute visual signature position
  //--------------------------------------------------------------------------//

  DEBUG &&
    console.log("addSignatoriesToPdf > renderSignatories: ", {
      signatoriesComputed,

      signatoriesLength: signatoriesComputed.length,

      pageSize,
      pageContentRectangle,
      pageContentCoordsLimits,

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

  //--------------------------------------------------------------------------//

  addSignaturesSealPlaceholder({
    pdfDoc,
    pdfPage,
    pdfFonts,

    pageSize,
    pageContentRectangle,
    pageContentCoordsLimits,
    margins,

    signatoriesComputed,
    rowHeight,
  });
};

//----------------------------------------------------------------------------//

const addSignatoriesToPdf = async (pdfDoc, debug = false) => {
  DEBUG = debug;

  const signatories = generateSignatories(2, 30);

  const pdfFonts = await loadPdfFonts(pdfDoc);

  renderSignatories({ pdfDoc, pdfFonts, signatories });

  return pdfDoc;
};

module.exports = {
  addSignatoriesToPdf,
};