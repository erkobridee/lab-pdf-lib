// const { StandardFonts } = require("pdf-lib");
// const fontkit = require("@pdf-lib/fontkit");

// const { loadFontFile } = require("./helpers/fs");
const {
  COLOR,
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

const drawCentralVerticalLine = (
  pdfPage,
  pageWidth,
  pageHeight,
  pageMargin = MARGIN
) => {
  const x = pageWidth / 2;

  // https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawlineoptions
  const lineOptions = {
    thickness: 1,
    color: PDF_RGB_CENTRAL_VERTICAL_LINE,
    end: { x, y: pageHeight - pageMargin },
    start: { x, y: pageMargin },
  };

  pdfPage.drawLine(lineOptions);
};

const drawPageMargins = (
  pdfPage,
  pageWidth,
  pageHeight,
  pageMargin = MARGIN
) => {
  // https://pdf-lib.js.org/docs/api/interfaces/pdfpagedrawrectangleoptions
  const rectangleOptions = {
    ...getPDFCoordsFromPage({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      margins: pageMargin,
      // margins: {
      //   top: 20,
      //   bottom: 30,
      //   left: 15,
      //   right: 40,
      // },
      pdfPage,
    }),

    borderColor: PDF_RGB_MARGIN,
    borderWidth: 1,
  };

  console.log(
    "addSignatoriesToPdf > drawPageMargins > rectangle options: ",
    rectangleOptions
  );

  pdfPage.drawRectangle(rectangleOptions);
};

const calculateSealPlacePosition = ({
  pageWidth,
  pageMargin = MARGIN,
  width = 315,
  height = 140,
}) => ({ y: pageMargin, x: pageWidth - (pageMargin + width), width, height });

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
  pageWidth,
  pageHeight,
  pageMargin = MARGIN,
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
    x: pageMargin,
    y: pageHeight - pageMargin,
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

  drawPageMargins(pdfPage, pageWidth, pageHeight);
  drawCentralVerticalLine(pdfPage, pageWidth, pageHeight);

  const sealPosition = calculateSealPlacePosition({
    pageWidth,
    pageHeight,
  });

  pdfPage = await drawSignatories({
    pdfDoc,
    pdfPage,
    pageWidth,
    pageHeight,
    sealPosition,
  });

  drawPageSealPlace(pdfPage, sealPosition);

  return pdfDoc;
};

module.exports = {
  addSignatoriesToPdf,
};
