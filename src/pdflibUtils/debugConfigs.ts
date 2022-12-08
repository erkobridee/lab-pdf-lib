import { COLOR } from "./colors";

//----------------------------------------------------------------------------//

export const PDF_LIB_UTILS_RENDER_CONFIG = {
  renderPage: {
    margins: {
      borderColor: COLOR.AIR_FORCE_BLUE,
      borderWidth: 1,
    },
    verticalGuideLine: {
      thickness: 1,
      color: COLOR.RED,
    },
    horizontalGuideLines: {
      thickness: 1,
      color: COLOR.RED,
    },
  },

  renderSignature: {
    borderColor: COLOR.SLATE_GRAY,
    borderWidth: 1,
  },

  renderSignatureContent: {
    color: COLOR.GHOST_WHITE,
    borderColor: COLOR.SILVER,
    borderWidth: 1,
  },

  rendeSealRectangle: {
    color: COLOR.FLORAL_WHITE,
    borderColor: COLOR.NAVAJO_WHITE,
    borderWidth: 1,
  },
};

export type TPdfLibUtilsRenderConfig = typeof PDF_LIB_UTILS_RENDER_CONFIG;
export type TPdfLibUtilsRenderConfigKeys = keyof TPdfLibUtilsRenderConfig;

//----------------------------------------------------------------------------//

export const PDF_LIB_UTILS_CONFIG = {
  debug: false,

  renderPage: false,

  renderSignature: false,
  renderSignatureContent: false,

  rendeSealRectangle: false,
};

export type TPdfLibUtilsConfig = typeof PDF_LIB_UTILS_CONFIG;
export type TPdfLibUtilsConfigKeys = keyof TPdfLibUtilsConfig;

//----------------------------------------------------------------------------//

const set = (key: TPdfLibUtilsConfigKeys, flag = false) =>
  (PDF_LIB_UTILS_CONFIG[key] = flag);

const setAll = (
  flag = false,
  keys: TPdfLibUtilsConfigKeys[] = Object.keys(
    PDF_LIB_UTILS_CONFIG
  ) as TPdfLibUtilsConfigKeys[]
) => {
  keys.forEach((key) => {
    set(key, flag);
  });
};

//----------------------------------------------------------------------------//

export const debugAll = () => setAll(true);

export const resetDebugAll = () => setAll(false);

export const debugSet = (keys: TPdfLibUtilsConfigKeys[], flag = true) => {
  setAll(flag, keys);
};

//----------------------------------------------------------------------------//

export const shouldDebug = (key?: TPdfLibUtilsConfigKeys) => {
  if (PDF_LIB_UTILS_CONFIG.debug) return true;
  return key ? PDF_LIB_UTILS_CONFIG[key] || false : false;
};

//----------------------------------------------------------------------------//

export const getDebugRenderConfig = (key: TPdfLibUtilsRenderConfigKeys): any =>
  PDF_LIB_UTILS_RENDER_CONFIG[key] || {};

//----------------------------------------------------------------------------//
