import type { PDFDocument, PDFPage } from "pdf-lib";
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

import { IPDFRectangle, getPDFCoordsLimits } from "@/pdflibUtils";

interface IAddSealSignaturesWidgetPlaceholderOptions {
  /** needed to access the AcroForm and also the pdf context object */
  pdfDoc: PDFDocument;
  /** the page which will be added the widget */
  pdfPage: PDFPage;
  /** id for the widget, that lately will be used by the LuxTrust to render the Seal */
  acroformId: string;
  /** position of the widget on the page */
  rectangle: IPDFRectangle;
}

export const addSealSignaturesWidgetPlaceholder = ({
  pdfDoc,
  pdfPage,
  acroformId,
  rectangle,
}: IAddSealSignaturesWidgetPlaceholderOptions) => {
  const { xLeft, yBottom, xRight, yTop } = getPDFCoordsLimits({ rectangle });

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

  /*
    Creates an additional shape on pdf, which acts as background for
    the signature text which is added by external signature provider later on (e.g. LuxTrust)
  */
  const sigAppearanceStream = PDFContentStream.of(
    PDFDict.fromMapWithContext(sigAppearanceStreamMapDict, pdfDoc.context),
    drawRectangle({
      x: PDFNumber.of(0),
      y: PDFNumber.of(0),
      width: PDFNumber.of(rectangle.width),
      height: PDFNumber.of(rectangle.height),
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
  arrayRect.push(PDFNumber.of(xLeft));
  arrayRect.push(PDFNumber.of(yBottom));
  arrayRect.push(PDFNumber.of(xRight));
  arrayRect.push(PDFNumber.of(yTop));
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
