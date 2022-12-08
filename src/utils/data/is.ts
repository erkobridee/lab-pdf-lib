/*
  JavaScript TypeOf – How to Check the Type of a Variable or Object in JS | freeCodeCamp
  https://www.freecodecamp.org/news/javascript-typeof-how-to-check-the-type-of-a-variable-or-object-in-js/

  Check if a Value is an Object using JavaScript | Borislav Hadzhiev
  https://bobbyhadz.com/blog/javascript-check-if-value-is-object
*/

export const TYPE_OF = {
  UNDEDEFINED: "undefined",
  BOOLEAN: "boolean",
  BIGINT: "bigint",
  NUMBER: "number",
  STRING: "string",
  OBJECT: "object",
  FUNCTION: "function",
  SYMBOL: "symbol",
} as const;

export const isUndefined = <T = unknown>(argument: T) =>
  typeof argument === TYPE_OF.UNDEDEFINED;

export const isDefined = <T = unknown>(argument: T | undefined) =>
  !isUndefined(argument);

export const isSymbol = <T = unknown>(argument: T) =>
  typeof argument === TYPE_OF.SYMBOL;

export const isNumber = <T = unknown>(argument: T) =>
  typeof argument === TYPE_OF.NUMBER &&
  !isNaN(argument as unknown as number) &&
  !isFinite(argument as unknown as number);

export const isString = <T = unknown>(argument: T) =>
  typeof argument === TYPE_OF.STRING;

export const isNull = <T = unknown>(argument: T) => argument === null;

export const isFunction = <T = unknown>(argument: T) =>
  typeof argument === TYPE_OF.FUNCTION;

export const isArray = <T = unknown>(argument: T) =>
  isDefined(argument) && Array.isArray(argument);

//----------------------------------------------------------------------------//

export const isTypeOfObject = <T = unknown>(argument: T) =>
  typeof argument === TYPE_OF.OBJECT;

export const isObject = (argument: any) =>
  isTypeOfObject(argument) &&
  !isNull(argument) &&
  !isArray(argument) &&
  isFunction(argument.hasOwnProperty);

/**
 * check if a given js object has attributes
 */
export const isObjectDefined = (argument: any) =>
  isObject(argument) && Object.keys(argument).length > 0;

/**
 * check if a given set of attributes are defined on the given object
 */
export const isObjectAttributesDefined = (
  argument: any,
  attributes: string[]
) => {
  if (!isObjectDefined(argument) || attributes.length === 0) {
    return false;
  }

  const objectKeys = Object.keys(argument);

  const presentAttributes = objectKeys.reduce((acc, key) => {
    if (attributes.includes(key)) {
      acc.push(key);
    }
    return acc;
  }, [] as string[]);

  return presentAttributes.length === attributes.length;
};

//----------------------------------------------------------------------------//
// https://www.color-hex.com/

const hexCharacters = "a-f\\d";
const match3or4Hex = `#?[${hexCharacters}]{3}[${hexCharacters}]?`;
const match6or8Hex = `#?[${hexCharacters}]{6}([${hexCharacters}]{2})?`;
const nonHexChars = new RegExp(`[^#${hexCharacters}]`, "gi");
const validHexSize = new RegExp(`^${match3or4Hex}$|^${match6or8Hex}$`, "i");

export const isValidHexColor = (hex?: string) =>
  !!hex && (validHexSize.test(hex) || !nonHexChars.test(hex));

//----------------------------------------------------------------------------//
