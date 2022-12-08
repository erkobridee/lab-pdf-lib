import path from "node:path";

import { FILES_DIR, writeFile } from "@/utils/fs";

//----------------------------------------------------------------------------//

const PDF_OUTPUT_DIR = path.join(FILES_DIR, "output");

export const writePdfFile = (
  fileContent: string | NodeJS.ArrayBufferView,
  fileName = "result"
) => {
  const filePath = path.join(PDF_OUTPUT_DIR, `${fileName}.pdf`);
  writeFile(filePath, fileContent);
};

export default writePdfFile;
