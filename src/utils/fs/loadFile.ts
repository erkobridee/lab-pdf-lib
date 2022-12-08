import fs from "node:fs";

export const loadFile = (filePath: string) => {
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
