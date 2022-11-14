/*
  JavaScript TypeOf – How to Check the Type of a Variable or Object in JS | freeCodeCamp
  https://www.freecodecamp.org/news/javascript-typeof-how-to-check-the-type-of-a-variable-or-object-in-js/

  Check if a Value is an Object using JavaScript | Borislav Hadzhiev
  https://bobbyhadz.com/blog/javascript-check-if-value-is-object
*/

const TYPE_OF = {
  UNDEDEFINED: "undefined",
  BOOLEAN: "boolean",
  BIGINT: "bigint",
  NUMBER: "number",
  STRING: "string",
  OBJECT: "object",
  FUNCTION: "function",
  SYMBOL: "symbol",
};

const isUndefined = (value) => typeof value === TYPE_OF.UNDEDEFINED;

const isSymbol = (value) => typeof value === TYPE_OF.SYMBOL;

const isNumber = (value) =>
  typeof value === TYPE_OF.NUMBER && value !== NaN && value !== Infinity;

const isString = (value) => typeof value === TYPE_OF.STRING;

const isNull = (value) => value === null;

const isFunction = (value) => typeof value === TYPE_OF.FUNCTION;

const isArray = (value) => value && Array.isArray(value);

const isTypeOfObject = (value) => typeof value === TYPE_OF.OBJECT;

const isObject = (value) =>
  isTypeOfObject(value) &&
  !isNull(value) &&
  !isArray(value) &&
  isFunction(value.hasOwnProperty);

module.exports = {
  TYPE_OF,
  isTypeOfObject,
  isUndefined,
  isSymbol,
  isNumber,
  isString,
  isNull,
  isFunction,
  isArray,
  isObject,
};
