import { loadFile } from "@/utils/fs";

import {
  TFontFamilyFromFile,
  TFontStyle,
  FontStyle,
  getFontFilePath,
} from "./definitions";

//----------------------------------------------------------------------------//

export const loadFontFile = (
  fontname: TFontFamilyFromFile,
  style: TFontStyle = FontStyle.NORMAL
) => {
  const filename = getFontFilePath(fontname, style);
  if (!filename) {
    throw new Error(`Font file of ${fontname} is not available`);
  }
  return loadFile(filename);
};

export default loadFontFile;
