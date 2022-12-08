export interface ISignatureRenderPosition {
  page: number;

  x: number;
  y: number;

  width: number;
  height: number;

  /** default scale value is 1 */
  scale?: number;
}

export const SignatureRenderPositionRequiredAttributes = [
  "page",
  "x",
  "y",
  "width",
  "height",
];

export interface ISignatureTextSize {
  /** signature default font-size is 20 */
  signature?: number;

  /** info default font-size is 8 */
  info?: number;
}

//----------------------------------------------------------------------------//
