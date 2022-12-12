import type { PDFDocument, PDFPage } from "pdf-lib";

import type { ISignatureFonts, IPDFRectangle } from "@/pdflibUtils";

//---===---//

import {
  PDFName,
  PDFDict,
  PDFContentStream,
  PDFNumber,
  PDFString,
  PDFArray,
  degrees,
  drawRectangle,
} from "pdf-lib";

import {
  COLOR,
  shouldDebug,
  getDebugRenderConfig,
  getPDFCoordsInsideRectangle,
} from "@/pdflibUtils";

import * as math from "@/utils/math";

//----------------------------------------------------------------------------//

interface IDebugHelperOptions {
  pdfPage: PDFPage;
  rectangle: IPDFRectangle;
  fonts: ISignatureFonts;
}

const DEBUG_KEY = "rendeSealRectangle";
const debugHelper = ({ pdfPage, rectangle, fonts }: IDebugHelperOptions) => {
  if (!shouldDebug(DEBUG_KEY)) return;

  pdfPage.drawRectangle({
    ...rectangle,
    ...getDebugRenderConfig(DEBUG_KEY),
  });

  //---===---//

  const { infoFont } = fonts;
  const fontSize = 10;

  const infoHeightAtDesiredFontSize = math.roundUp(
    infoFont.heightAtSize(fontSize)
  );

  const textMessage = "Seal placeholder";
  const textMessageWidth = math.roundUp(
    infoFont.widthOfTextAtSize(textMessage, fontSize)
  );
  const textMessageX = math.geometry.centralizeRectangleOnSize(
    rectangle.width,
    textMessageWidth
  );
  const textMessageY = math.geometry.centralizeRectangleOnSize(
    rectangle.height,
    infoHeightAtDesiredFontSize
  );

  pdfPage.drawText(textMessage, {
    color: COLOR.BLACK,
    size: fontSize,
    font: infoFont,
    ...getPDFCoordsInsideRectangle({
      x: textMessageX,
      y: textMessageY,
      width: textMessageWidth,
      height: infoHeightAtDesiredFontSize,
      rectangle,
    }),
  });
};

//----------------------------------------------------------------------------//

interface IAddSealSignaturesWidgetPlaceholderOptions {
  /** needed to access the AcroForm and also the pdf context object */
  pdfDoc: PDFDocument;

  /** the page which will be added the widget */
  pdfPage: PDFPage;

  /** id for the widget, that lately will be used by the LuxTrust to render the Seal */
  acroformId: string;

  /** position of the widget on the page */
  rectangle: IPDFRectangle;

  fonts: ISignatureFonts;
}

export const addSealSignaturesWidgetPlaceholder = ({
  pdfDoc,
  pdfPage,
  acroformId,
  rectangle,
  fonts,
}: IAddSealSignaturesWidgetPlaceholderOptions) => {
  debugHelper({ pdfPage, rectangle, fonts });

  //--------------------------------------------------------------------------//

  const sigAppearanceStreamMapDict = new Map();
  const resourcesMap = new Map();
  resourcesMap.set(PDFName.Font, PDFName.of("Helvetica"));
  sigAppearanceStreamMapDict.set(
    PDFName.of("Resources"),
    PDFDict.fromMapWithContext(resourcesMap, pdfDoc.context)
  );
  sigAppearanceStreamMapDict.set(PDFName.Type, PDFName.XObject);
  sigAppearanceStreamMapDict.set(PDFName.of("Subtype"), PDFName.of("Form"));

  //--------------------------------------------------------------------------//

  const { x, y, width, height } = rectangle;

  /*
    Creates an additional shape on pdf, which acts as background for
    the signature text which is added by external signature provider later on (e.g. LuxTrust)
  */
  const sigAppearanceStream = PDFContentStream.of(
    PDFDict.fromMapWithContext(sigAppearanceStreamMapDict, pdfDoc.context),
    drawRectangle({
      x: PDFNumber.of(0),
      y: PDFNumber.of(0),
      width: PDFNumber.of(width),
      height: PDFNumber.of(height),
      color: undefined,
      borderWidth: 0,
      borderColor: undefined,
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0),
    })
  );

  const sigAppearanceStreamRef = pdfDoc.context.register(sigAppearanceStream);

  //--------------------------------------------------------------------------//

  // Reference documentation PDF
  // Define the signature widget annotation - Table 164 (Page 391)
  // https://archive.org/details/pdf320002008/page/n389/mode/2up
  const widgetDictMap = new Map();
  const APMap = new Map();
  const arrayRect = PDFArray.withContext(pdfDoc.context);
  arrayRect.push(PDFNumber.of(x));
  arrayRect.push(PDFNumber.of(y));
  arrayRect.push(PDFNumber.of(x + width));
  arrayRect.push(PDFNumber.of(y + height));
  APMap.set(PDFName.of("N"), sigAppearanceStreamRef);

  widgetDictMap.set(PDFName.Type, PDFName.of("Annot"));
  widgetDictMap.set(PDFName.of("Subtype"), PDFName.of("Widget"));
  widgetDictMap.set(PDFName.of("FT"), PDFName.of("Sig"));
  widgetDictMap.set(PDFName.of("Rect"), arrayRect);
  widgetDictMap.set(PDFName.of("T"), PDFString.of(acroformId));
  widgetDictMap.set(PDFName.of("F"), PDFNumber.of(4));
  widgetDictMap.set(PDFName.of("P"), pdfDoc.catalog.Pages().Kids().get(0));
  widgetDictMap.set(
    PDFName.of("AP"),
    PDFDict.fromMapWithContext(APMap, pdfDoc.context)
  );

  const widgetDict = PDFDict.fromMapWithContext(widgetDictMap, pdfDoc.context);
  const widgetDictRef = pdfDoc.context.register(widgetDict);

  //--------------------------------------------------------------------------//

  const arrayAnnots = PDFArray.withContext(pdfDoc.context);
  arrayAnnots.push(widgetDictRef);

  pdfPage.node.set(PDFName.Annots, arrayAnnots);

  //--------------------------------------------------------------------------//

  const acroForm = pdfDoc.catalog.lookupMaybe(PDFName.of("AcroForm"), PDFDict);

  if (!acroForm) {
    pdfDoc.catalog.set(
      PDFName.of("AcroForm"),
      pdfDoc.context.obj({
        SigFlags: 3,
        Fields: [widgetDictRef],
      })
    );
  } else {
    const fields = acroForm.lookup(PDFName.of("Fields"), PDFArray);
    fields.push(widgetDictRef);
  }

  //--------------------------------------------------------------------------//

  return pdfDoc;
};
