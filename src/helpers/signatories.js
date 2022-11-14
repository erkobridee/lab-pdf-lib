const short = require("short-uuid");

const { getRandomName, getRandomInt } = require("./random");
const { sha256 } = require("./sha256");

//----------------------------------------------------------------------------//

const shortTranslator = short();

const buildSignatory = (nameSize) => {
  const name = getRandomName(nameSize);
  const uuid = shortTranslator.uuid();
  const shortId = shortTranslator.fromUUID(uuid);
  const hash = sha256({ name, uuid, shortId });
  return { name, uuid, shortId, hash };
};

const generateSignatories = (min = 3, max = 15, nameSize) => {
  const amount = getRandomInt(min, max);
  let signatories = [];
  for (let i = 0; i < amount; i++) {
    signatories.push(buildSignatory(nameSize));
  }
  return signatories;
};

module.exports = {
  generateSignatories,
};
