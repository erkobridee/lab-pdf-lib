import { PDFDocument, SaveOptions } from "pdf-lib";

const SAVE_OPTIONS: SaveOptions = {
  useObjectStreams: true,
};

export type TRawPdf = string | Uint8Array | ArrayBuffer;

export const loadPdfFrom = async (rawPdf: TRawPdf) => {
  return await PDFDocument.load(rawPdf, {
    ignoreEncryption: true,
  });
};

export const setProducerName = (
  pdfDoc: PDFDocument,
  producerName = "Erko Bridee"
) => {
  pdfDoc.setProducer(producerName);
};

export const savePdfToBytes = async (
  pdfDoc: PDFDocument,
  producerName?: string
) => {
  setProducerName(pdfDoc, producerName);

  const pdfDocBytes = await pdfDoc.save(SAVE_OPTIONS);

  // https://nodejs.org/docs/latest-v14.x/api/buffer.html
  return Buffer.from(pdfDocBytes);
};

export const savePdfToBase64 = async (
  pdfDoc: PDFDocument,
  producerName?: string
) => {
  setProducerName(pdfDoc, producerName);

  return await pdfDoc.saveAsBase64(SAVE_OPTIONS);
};

//----------------------------------------------------------------------------//

interface ISavePdfOptions {
  pdfDoc: PDFDocument;
  producerName?: string;
  saveAsBase64?: boolean;
}

export const savePdf = async ({
  pdfDoc,
  saveAsBase64 = false,
  producerName,
}: ISavePdfOptions) => {
  const saveFn = saveAsBase64 ? savePdfToBase64 : savePdfToBytes;

  return await saveFn(pdfDoc, producerName);
};
