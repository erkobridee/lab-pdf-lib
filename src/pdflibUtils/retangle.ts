import type { Rotation, PDFPage } from "pdf-lib";

//---===---//

import { degrees, toRadians } from "pdf-lib";

import {
  ISize,
  IPoint,
  IRectangleSpacings,
  TRectangleSpacings,
  getRectangleSpacings,
} from "@/utils/math/geometry";

import { isObject, isNumber } from "@/utils/data/is";

//----------------------------------------------------------------------------//

export interface IPDFRectangle extends ISize, IPoint {
  rotate?: Rotation;
}

//----------------------------------------------------------------------------//

export interface IPDFRectangleCoordsLimits {
  yTop: number;
  yBottom: number;
  xLeft: number;
  xRight: number;
}

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
  spacings = 0,
  scale = 1,
}: IGetPDFCoordsLimitsOptions): IPDFRectangleCoordsLimits => {
  const {
    top: rectanglePaddingTop,
    bottom: rectanglePaddingBottom,
    left: rectanglePaddingLeft,
    right: rectanglePaddingRight,
  } = getRectangleSpacings(spacings, scale);

  const {
    x: rectangleX,
    y: rectangleY,
    width: rectangleWidth,
    height: rectangleHeight,
  } = rectangle;

  const yTop = rectangleY + rectangleHeight - rectanglePaddingTop;
  const yBottom = rectangleY + rectanglePaddingBottom;

  const xRight = rectangleX + rectangleWidth - rectanglePaddingRight;
  const xLeft = rectangleX + rectanglePaddingLeft;

  return { yTop, yBottom, xLeft, xRight };
};

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
  spacings = 0,
  scale = 1,
  pdfPage,
}: IGetPDFCoordsFromPageOptions): IPDFRectangle => {
  const rotation = pdfPage.getRotation();

  const { width: pageWidth, height: pageHeight } = pdfPage.getSize();

  const { top, bottom, left, right } = getRectangleSpacings(spacings, scale);

  x = (x ?? 0) + left;
  y = (y ?? 0) + bottom;

  width = (width ?? pageWidth) * scale - (left + right);
  height = (height ?? pageHeight) * scale - (top + bottom);

  const correction = getPDFCompensateRotation({
    x,
    y,
    height,
    scale,
    onSize: {
      width: pageWidth,
      height: pageHeight,
    },
    rotation,
  });

  return {
    x: correction.x,
    y: correction.y,
    width,
    height,
  };
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
  x,
  y,
  width = 10,
  height = 10,
  top,
  bottom,
  left,
  right,
  scale = 1,
  rectangle,
  rectanglePaddings = 0,
  keepInside = false,
  rotateWith = true,
}: IGetPDFCoordsInsideRectangleOptions): IPDFRectangle => {
  const requiredRectangleAttributes = ["x", "y", "width", "height"];
  if (isObject(rectangle)) {
    const missingRectangleAttributes = requiredRectangleAttributes.reduce(
      (acc, property) => {
        if (!rectangle.hasOwnProperty(property)) {
          acc.push(property);
        }
        return acc;
      },
      []
    );

    if (missingRectangleAttributes.length > 0) {
      throw new Error(
        `missing attributes { ${missingRectangleAttributes.join(
          ", "
        )} } on the Rectangle object`
      );
    }
  } else {
    throw Error(
      `the rectangle attribute must be an object that defines { ${requiredRectangleAttributes.join(
        ", "
      )} }`
    );
  }

  //---===---//

  if (!rotateWith && keepInside) {
    rotateWith = true;
  }

  const { rotate: rectangleRotate } = rectangle;

  const { yTop, yBottom, xLeft, xRight } = getPDFCoordsLimits({
    rectangle,
    spacings: rectanglePaddings,
    scale,
  });

  //---===---//

  let newWidth = width * scale;
  let newHeight = height * scale;

  let newX = xLeft + (x ?? 0);
  let newY = yTop - (height + (y ?? 0));

  if (isNumber(left) || isNumber(right)) {
    if (isNumber(left)) {
      newX = xLeft + left;
    }

    if ((isNumber(left) || isNumber(x)) && isNumber(right)) {
      newWidth = xRight - newX - right;
    } else if (isNumber(right)) {
      newX = xRight - (newWidth + right);
    }
  }

  if (isNumber(top) || isNumber(bottom)) {
    if (isNumber(bottom)) {
      newY = yBottom + bottom;
    }

    if ((isNumber(bottom) || isNumber(y)) && isNumber(top)) {
      newHeight = yTop - newY - top;
    } else if (isNumber(top)) {
      newY = yTop - (newHeight + top);
    }
  }

  if (keepInside) {
    const xWidth = newX + newWidth;
    if (xWidth > xRight) {
      newWidth = newWidth - (xRight - xWidth);
    }

    const yHeight = newY + newHeight;
    if (yHeight > yTop) {
      newHeight = newHeight - (yTop - yHeight);
    }
  }

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
    rotate: rotateWith ? rectangleRotate : undefined,
  };
};

//----------------------------------------------------------------------------//
