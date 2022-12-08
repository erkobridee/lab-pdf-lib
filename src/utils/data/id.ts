/*
  https://github.com/oculus42/short-uuid

  it also depends of the following library
  https://github.com/uuidjs/uuid

  usage sample:
  https://replit.com/@erkobridee/testing-short-uuid
*/

const shortUuid = require("short-uuid");

/**
 * https://github.com/oculus42/short-uuid/blob/develop/index.js#L68
 */
export const shortUuidTranslator = shortUuid(shortUuid.constants.flickrBase58);

/**
 * Generate a new regular UUID.
 *
 * https://github.com/oculus42/short-uuid/blob/develop/index.js#L97
 */
export const uuid = shortUuidTranslator.uuid;

/**
 * long -> short
 *
 * https://github.com/oculus42/short-uuid/blob/develop/index.js#L98
 */
export const encodeUuid = shortUuidTranslator.fromUUID;

/**
 * short -> long
 *
 * https://github.com/oculus42/short-uuid/blob/develop/index.js#L99
 */
export const decodeShortUuid = shortUuidTranslator.toUUID;

//----------------------------------------------------------------------------//

export const encodeUuids = (ids: string[]): string =>
  ids.map(encodeUuid).join("_");

export const decodeShortUuids = (encodedIds: string): string[] =>
  encodedIds.split("_").map(decodeShortUuid);
