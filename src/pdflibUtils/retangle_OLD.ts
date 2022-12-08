import type { Rotation, PDFPage } from "pdf-lib";

import type { ISize, IPoint } from "@/utils/math/geometry";

//---===---//

import { degrees, toRadians } from "pdf-lib";

import {
  CoordsOrientationPDF,
  IRectangle,
  IRectangleFrame,
  IRectangleSpacings,
  TRectangleSpacings,
  getCoordsFromFrame,
  getCoordsInsideRectangle,
  getRectangleCoordsLimits,
} from "@/utils/math/geometry/rectangle_OLD";

//----------------------------------------------------------------------------//

export interface IPDFRectangle extends ISize, IPoint {
  rotate?: Rotation;
}

//----------------------------------------------------------------------------//
// @begin: helpers to transform IPDFRectangle <-> IRectangle(Frame)

const getRectangleFrameFromPDFPageSize = (size: ISize): IRectangleFrame => ({
  ...size,
  orientation: CoordsOrientationPDF,
});

const toPDFRectangle = (rectangle: IRectangle): IPDFRectangle => {
  const { x, y, width, height } = rectangle;
  return { x, y, width, height };
};

const toRectangle = (rectangle: IPDFRectangle): IRectangle => {
  const { x, y, width, height } = rectangle;
  return { x, y, width, height, orientation: CoordsOrientationPDF };
};

// @end: helpers to transform IPDFRectangle <-> IRectangle(Frame)
//----------------------------------------------------------------------------//

interface IGetPDFCompensateRotation extends IPoint {
  height: number;
  onSize: ISize;

  scale?: number;
  rotation?: Rotation;
}

/**
 * kevinswartz matrix calculation
 *
 * https://github.com/Hopding/pdf-lib/issues/65#issuecomment-468064410
 *
 * the height attribute on the parameter it's the rectangle height or it could be the font-size value
 *
 * @param {IGetPDFCompensateRotation} options
 *
 * @returns {IPoint} position
 */
export const getPDFCompensateRotation = ({
  x,
  y,
  height,
  onSize: { width: onWidth, height: onHeight },
  scale = 1,
  rotation = degrees(0),
}: IGetPDFCompensateRotation): IPoint => {
  const rotationRads = toRadians(rotation);
  const { angle } = rotation;

  const coordsFromBottomLeft = {
    x: x / scale,
    y: [90, 270].includes(angle)
      ? onWidth - (y + height) / scale
      : onHeight - (y + height) / scale,
  };

  switch (angle) {
    case 90:
      return {
        x:
          coordsFromBottomLeft.x * Math.cos(rotationRads) -
          coordsFromBottomLeft.y * Math.sin(rotationRads) +
          onWidth,
        y:
          coordsFromBottomLeft.x * Math.sin(rotationRads) +
          coordsFromBottomLeft.y * Math.cos(rotationRads),
      };
    case 180:
      return {
        x:
          coordsFromBottomLeft.x * Math.cos(rotationRads) -
          coordsFromBottomLeft.y * Math.sin(rotationRads) +
          onWidth,
        y:
          coordsFromBottomLeft.x * Math.sin(rotationRads) +
          coordsFromBottomLeft.y * Math.cos(rotationRads) +
          onHeight,
      };
    case 270:
      return {
        x:
          coordsFromBottomLeft.x * Math.cos(rotationRads) -
          coordsFromBottomLeft.y * Math.sin(rotationRads),
        y:
          coordsFromBottomLeft.x * Math.sin(rotationRads) +
          coordsFromBottomLeft.y * Math.cos(rotationRads) +
          onHeight,
      };
    default:
      return { x: coordsFromBottomLeft.x, y: coordsFromBottomLeft.y };
  }
};

//----------------------------------------------------------------------------//

interface IGetPDFCoordsFromPageOptions extends Partial<IPDFRectangle> {
  spacings?: TRectangleSpacings;
  scale?: number;
  pdfPage: PDFPage;
}

/**
 * get the pdf coords from pdf page
 *
 * pdf positioning system: x: 0 = left and y: 0 = bottom, from x: 0 = left and y: 0 = top
 */
export const getPDFCoordsFromPage = ({
  x,
  y,
  width,
  height,
  spacings,
  scale,
  pdfPage,
}: IGetPDFCoordsFromPageOptions): IPDFRectangle => {
  const rotation = pdfPage.getRotation();
  const pageSize = pdfPage.getSize();

  const frame = getRectangleFrameFromPDFPageSize(pageSize);

  const coords = toPDFRectangle(
    getCoordsFromFrame({ x, y, width, height, frame, scale, spacings })
  );

  const correction = getPDFCompensateRotation({
    ...coords,
    onSize: pageSize,
    rotation,
  });

  return { ...coords, ...correction };
};

//----------------------------------------------------------------------------//

interface IGetPDFCoordsInsideRectangleOptions
  extends Partial<IPDFRectangle>,
    Partial<IRectangleSpacings> {
  rectangle: IPDFRectangle;

  scale?: number;
  rectanglePaddings?: TRectangleSpacings;
  keepInside?: boolean;
  rotateWith?: boolean;
}

/**
 * keep in mind that the pdf positioning orientation start at left (x: 0) and bottom (y: 0)
 *
 * the parameters consider the positioning orientation from left (x: 0) and top (y: 0)
 */
export const getPDFCoordsInsideRectangle = ({
  keepInside = false,
  rotateWith = true,
  rectangle,
  ...props
}: IGetPDFCoordsInsideRectangleOptions): IPDFRectangle => {
  if (!rotateWith && keepInside) {
    rotateWith = true;
  }

  const coords = toPDFRectangle(
    getCoordsInsideRectangle({
      ...props,
      rectangle: toRectangle(rectangle),
      keepInside,
    })
  );

  return { ...coords, rotate: rotateWith ? rectangle.rotate : undefined };
};

//----------------------------------------------------------------------------//

interface IGetPDFCoordsLimitsOptions {
  rectangle: IPDFRectangle;
  spacings?: TRectangleSpacings;
  scale?: number;
}

/**
 * Calculate the x and y postitions referent of 4 corners
 *
 * @param {IGetPDFCoordsLimitsOptions} options
 * @returns { xRight, xLeft, yTop, yBottom }
 */
export const getPDFCoordsLimits = ({
  rectangle,
  ...props
}: IGetPDFCoordsLimitsOptions) =>
  getRectangleCoordsLimits({
    rectangle: toRectangle(rectangle),
    ...props,
  });

//----------------------------------------------------------------------------//
