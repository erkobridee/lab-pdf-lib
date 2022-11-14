const fs = require("fs");
const path = require("path");

//----------------------------------------------------------------------------//

const ROOT_DIR = path.join(__dirname, "..", "..");

const loadFile = (filePath) => {
  try {
    return fs.readFileSync(filePath);
  } catch (e) {
    console.error({
      message: `Error when tried to load the file ${filePath}`,
      errorStack: e.stack,
      errorName: e.name,
      errorMessage: e.message,
    });
  }
  return undefined;
};

const writeFile = (filePath, content) => {
  try {
    fs.writeFileSync(filePath, content);
  } catch (e) {
    console.error({
      message: `Error when tried to write the file ${filePath}`,
      errorStack: e.stack,
      errorName: e.name,
      errorMessage: e.message,
    });
  }
};

//----------------------------------------------------------------------------//

const FILES_DIR = "files";

const FONTS_DIR = path.join(ROOT_DIR, FILES_DIR, "font");

const FONT_NAME = {
  PATRICK_HAND: "PatrickHand",
  ARCHITECTS_DAUGHTER: "ArchitectsDaughter",
};

const FONT_FILE_MAP = {
  [FONT_NAME.PATRICK_HAND]: path.join(FONTS_DIR, "PatrickHand-Regular.ttf"),
  [FONT_NAME.ARCHITECTS_DAUGHTER]: path.join(
    FONTS_DIR,
    "ArchitectsDaughter.ttf"
  ),
};

const loadFontFile = (fontName = FONT_NAME.PATRICK_HAND) =>
  loadFile(FONT_FILE_MAP[fontName]);

const PDF_INPUT_FILE = path.join(ROOT_DIR, `${FILES_DIR}/input/source.pdf`);
const loadPdfFile = () => loadFile(PDF_INPUT_FILE);

const PDF_OUTPUT_FILE = path.join(ROOT_DIR, `${FILES_DIR}/output/result.pdf`);
const writePdfFile = (fileContent) => writeFile(PDF_OUTPUT_FILE, fileContent);

// console.log({
//   __dirname,
//   ROOT_DIR,
//   PDF_INPUT_FILE,
//   PDF_OUTPUT_FILE,
//   FONT_FILE_MAP,
// });

module.exports = {
  FONT_NAME,
  loadFontFile,
  loadPdfFile,
  writePdfFile,
};
