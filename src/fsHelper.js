const fs = require("fs");
const path = require("path");

//----------------------------------------------------------------------------//

const ROOT_DIR = path.join(__dirname, "..");

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

const FONT_FILE = path.join(
  ROOT_DIR,
  `${FILES_DIR}/font/PatrickHand-Regular.ttf`
);
const loadFontFile = () => loadFile(FONT_FILE);

const PDF_INPUT_FILE = path.join(ROOT_DIR, `${FILES_DIR}/input/source.pdf`);
const loadPdfFile = () => loadFile(PDF_INPUT_FILE);

const PDF_OUTPUT_FILE = path.join(ROOT_DIR, `${FILES_DIR}/output/result.pdf`);
const writePdfFile = (fileContent) => writeFile(PDF_OUTPUT_FILE, fileContent);

// TODO: remove
// console.log({
//   __dirname,
//   ROOT_DIR,
//   FONT_FILE,
//   PDF_INPUT_FILE,
//   PDF_OUTPUT_FILE,
// });

module.exports = {
  loadFontFile,
  loadPdfFile,
  writePdfFile,
};
