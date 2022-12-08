import fs from "node:fs";

export const writeFile = (
  filePath: string,
  content: string | NodeJS.ArrayBufferView,
  options?: fs.WriteFileOptions
) => {
  try {
    fs.writeFileSync(filePath, content, options);
  } catch (e) {
    console.error({
      message: `Error when tried to write the file ${filePath}`,
      errorStack: e.stack,
      errorName: e.name,
      errorMessage: e.message,
    });
  }
};
