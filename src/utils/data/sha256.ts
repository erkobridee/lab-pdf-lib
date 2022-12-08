// we're using the node v14 on AWS lambdas
// https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html

// https://nodejs.org/docs/latest-v14.x/api/crypto.html#crypto_crypto_createhash_algorithm_options

const crypto = require("crypto");

const { isTypeOfObject } = require("./is");

export const sha256 = <T>(content: T): string =>
  crypto
    .createHash("sha256")
    .update(isTypeOfObject(content) ? JSON.stringify(content) : content)
    .digest("hex");
