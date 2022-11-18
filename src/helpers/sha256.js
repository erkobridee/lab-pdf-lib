// https://nodejs.org/docs/latest-v16.x/api/crypto.html#cryptocreatehashalgorithm-options

const { createHash } = require("node:crypto");

const { isTypeOfObject } = require("./is");

const sha256 = (content) =>
  createHash("sha256")
    .update(isTypeOfObject(content) ? JSON.stringify(content) : content)
    .digest("hex");

module.exports = {
  sha256,
};
