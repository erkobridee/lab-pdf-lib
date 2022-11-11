// const { StandardFonts } = require("pdf-lib");
// const fontkit = require("@pdf-lib/fontkit");

// const { loadFontFile } = require("./helpers/fs");
const {
  COLOR,
  getPDFCoordsLimits,
  getPDFCoordsFromPage,
  getPDFCoordsInsideRectangle,
} = require("./helpers/pdf");
const { generateSignatories } = require("./helpers/signatories");

const MARGIN = 10;
const GAP = MARGIN;
const PADDING = 5;

const PDF_RGB_MARGIN = COLOR.AIR_FORCE_BLUE;
const PDF_RGB_SEAL = COLOR.GAINSBORO;
const PDF_RGB_CENTRAL_VERTICAL_LINE = COLOR.NAVAJO_WHITE;
// const PDF_RGB_SIG_BG = COLOR.GHOST_WHITE;
// const PDF_RGB_SIG_FONT = COLOR.BLACK;

const drawCentralVerticalLine = (pdfPage, pageContentRectangle) => {
  const { xRight, yTop, yBottom } = getPDFCoordsLimits({
    rectangle: pageContentRectangle,
  });

  const x = xRight / 2;

  // https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawlineoptions
  const lineOptions = {
    thickness: 1,
    color: PDF_RGB_CENTRAL_VERTICAL_LINE,
    end: { x, y: yTop },
    start: { x, y: yBottom },
  };

  pdfPage.drawLine(lineOptions);
};

const drawPageMargins = (pdfPage, pageContentRectangle) => {
  // https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawrectangleoptions
  const rectangleOptions = {
    ...pageContentRectangle,

    borderColor: PDF_RGB_MARGIN,
    borderWidth: 1,
  };

  console.log(
    "addSignatoriesToPdf > drawPageMargins > rectangle options: ",
    rectangleOptions
  );

  pdfPage.drawRectangle(rectangleOptions);
};

const calculateSealRectangle = ({
  bottom = 0,
  right = 0,
  width = 315,
  height = 140,
  pageContentRectangle,
}) =>
  getPDFCoordsInsideRectangle({
    bottom,
    right,
    width,
    height,
    rectangle: pageContentRectangle,
  });

const drawPageSealPlace = (pdfPage, sealPosition) => {
  // https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawrectangleoptions
  const rectangleOptions = {
    ...sealPosition,

    color: PDF_RGB_SEAL,
  };

  console.log(
    "addSignatoriesToPdf > drawPageSealPlace > rectangle options: ",
    rectangleOptions
  );

  pdfPage.drawRectangle(rectangleOptions);
};

/*
  Position {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  ---

  Signatory {
    name: string;
    uuid: string;
    shortId: string;
    hash: string;
  }

  Options {
    pdfPage: PDFPage;
    
    pageMargin: number;
    pageWidth: number;
    pageHalfWidth: number;
    pageHeight: number;
    pageHalfHeight: number;

    gap: number;

    padding: string;
    fontSizeText: number;
    fontSizeInfo: number;

    lastPosition: Position;
  }
 */
const drawSignatory = (signatory, options) => {
  /*
    new position:

      y >= options.pageMargin && y <= (options.pageHeight - options.pageMargin)
      
      x >= options.pageMargin && x <= (options.pageWidth - options.pageMargin)

      options.lastPosition.x >= 0 && x > (options.lastPosition.x + options.lastPosition.width + options.gap)

  */
};

const drawSignatories = async ({
  pdfDoc,
  pdfPage,
  pageContentRectangle,
  sealPosition,
  padding = PADDING,
  gap = GAP,
  fontSizeText = 20,
  fontSizeInfo = 8,
}) => {
  const signatories = generateSignatories();

  // const padding = 5;
  // const fontSizeText = 20;
  // const fontSizeInfo = 8;

  pdfPage.drawText(JSON.stringify(signatories, null, 2), {
    x: pageContentRectangle.x,
    y: pageContentRectangle.y + pageContentRectangle.height,
    size: 8,
  });

  // TODO: define the code

  return pdfPage;
};

const addSignatoriesToPdf = async (pdfDoc) => {
  const currentLastIndex = pdfDoc.getPageCount() - 1;
  const currentLastPage = pdfDoc.getPage(currentLastIndex);
  const { width: pageWidth, height: pageHeight } = currentLastPage.getSize();

  console.log("addSignatoriesToPdf > current last page size: ", {
    width: pageWidth,
    height: pageHeight,
  });

  let pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

  const pageContentRectangle = getPDFCoordsFromPage({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    margins: MARGIN,
    pdfPage,
  });

  drawPageMargins(pdfPage, pageContentRectangle);
  drawCentralVerticalLine(pdfPage, pageContentRectangle);

  const sealPosition = calculateSealRectangle({
    pageContentRectangle,
  });

  pdfPage = await drawSignatories({
    pdfDoc,
    pdfPage,
    sealPosition,
    pageContentRectangle,
  });

  drawPageSealPlace(pdfPage, sealPosition);

  return pdfDoc;
};

module.exports = {
  addSignatoriesToPdf,
};
