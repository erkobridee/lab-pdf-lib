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

  const xMargin = margins.left + margins.right;

  //---===---//
  // vertical lines

  const xMiddle = pageContentRectangle.width / 2 + xMargin;

  pdfPage.drawLine({
    thickness,
    color: verticalLineColor,
    end: { x: xMiddle, y: yTop },
    start: { x: xMiddle, y: yBottom },
  });

  //---===---//
  // horizontal lines

  const yLeftLine = yTop + 3;

  pdfPage.drawLine({
    thickness,
    color: horizontalLineColor,
    start: { x: xLeft, y: yLeftLine },
    end: { x: xMiddle, y: yLeftLine },
  });

  const yRightLine = yBottom - 3;

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
  marginLineColor = COLOR.AIR_FORCE_BLUE,
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

  pageContentRectangle,
  pageContentCoordsLimits,

  margins = 10,
}) => {
  const pdfPage = addNewPdfPage({ pdfDoc });
  const pdfPageSize = pdfPage.getSize();

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
    pdfPageSize,
    pageContentRectangle,
    pageContentCoordsLimits,
  };
};

const renderSignatories = ({
  pdfDoc,
  signatories,

  margins = 10,
  paddings = 5,
  gap = 10,
}) => {
  let { pdfPage, pdfPageSize, pageContentRectangle, pageContentCoordsLimits } =
    addNewPage({ pdfDoc, margins });

  console.log("addSignatoriesToPdf > renderSignatories: ", {
    signatories,

    signatoriesLength: signatories.length,

    pageSize: pdfPageSize,
    pageContentRectangle,
    pageContentCoordsLimits,
  });
};

//----------------------------------------------------------------------------//

const addSignatoriesToPdf = async (pdfDoc, debug = false) => {
  DEBUG = debug;

  const signatories = generateSignatories(2, 20);

  renderSignatories({ pdfDoc, signatories });

  return pdfDoc;
};

module.exports = {
  addSignatoriesToPdf,
};
