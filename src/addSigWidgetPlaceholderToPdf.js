const {
  degrees,
  drawRectangle,
  PDFArray,
  PDFContentStream,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFString,
  rgb,
} = require("pdf-lib");

/*
  useful information 
  https://github.com/Hopding/pdf-lib/issues/112#issuecomment-1049456413
*/

/** adds a signature widget plaholder on the first page */
const addSigWidgetPlaceholderToPdf = async (pdfDoc) => {
  const acroformId = "sigPlaceholderId";

  const bottom = 10,
    right = 10,
    scale = 1,
    width = 250,
    height = 100,
    borderWidth = 1,
    color = rgb(204 / 255, 204 / 255, 204 / 255);

  //--------------------------------------------------------------------------//

  const acroForm = pdfDoc.catalog.lookupMaybe(PDFName.of("AcroForm"), PDFDict);

  const pdfPage = pdfDoc.getPage(0);
  const pdfPageWidth = pdfPage.getWidth();

  const y = bottom;
  const x = pdfPageWidth - (right + width * scale);

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

  const sigAppearanceStream = PDFContentStream.of(
    PDFDict.fromMapWithContext(sigAppearanceStreamMapDict, pdfDoc.context),
    drawRectangle({
      x: PDFNumber.of(0),
      y: PDFNumber.of(0),
      width: PDFNumber.of(width * scale),
      height: PDFNumber.of(height * scale),
      color,
      borderWidth,
      borderColor: color,
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
  arrayRect.push(PDFNumber.of(x + width * scale));
  arrayRect.push(PDFNumber.of(y + height * scale));
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

module.exports = {
  addSigWidgetPlaceholderToPdf,
};
