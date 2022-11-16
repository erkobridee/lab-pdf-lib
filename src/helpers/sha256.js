// https://nodejs.org/docs/latest-v16.x/api/crypto.html#cryptocreatehashalgorithm-options

const { createHash } = require("node:crypto");

const { isTypeOfObject } = require("./is");

const hashSha256 = createHash("sha256");

const sha256 = (content) =>
  hashSha256
    .update(isTypeOfObject(content) ? JSON.stringify(content) : content)
    .digest("hex");

module.exports = {
  sha256,
};
