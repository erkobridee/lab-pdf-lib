const short = require("short-uuid");

const { getRandomName, getRandomInt } = require("./random");
const { sha256 } = require("./sha256");

//----------------------------------------------------------------------------//

const shortTranslator = short();

const buildSignatory = () => {
  const name = getRandomName();
  const uuid = shortTranslator.uuid();
  const shortId = shortTranslator.fromUUID(uuid);
  const hash = sha256(JSON.stringify({ name, uuid, shortId }));
  return { name, uuid, shortId, hash };
};

const generateSignatories = (min = 3, max = 15) => {
  const amount = getRandomInt(min, max);
  let signatories = [];
  for (let i = 0; i < amount; i++) {
    signatories.push(buildSignatory());
  }
  return signatories;
};

module.exports = {
  generateSignatories,
};
