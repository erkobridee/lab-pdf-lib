import path from "node:path";

import { FILES_DIR, loadFile } from "@/utils/fs";

//----------------------------------------------------------------------------//

const PDF_INPUT_DIR = path.join(FILES_DIR, "input");

export const loadPdfFile = (fileName = "source") => {
  const filePath = path.join(PDF_INPUT_DIR, `${fileName}.pdf`);
  return loadFile(filePath);
};

export default loadPdfFile;
