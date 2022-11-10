const { createHash } = require("node:crypto");

const sha256 = (content) => createHash("sha256").update(content).digest("hex");

module.exports = {
  sha256,
};
