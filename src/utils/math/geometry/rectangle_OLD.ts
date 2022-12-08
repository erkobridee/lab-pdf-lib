import { isNumber, isObject } from "@/utils/data/is";

import { ISize, IPoint } from "./definitions";

//----------------------------------------------------------------------------//

export enum CoordsOrientation {
  /**
   * Position( x: 0, y: 0 ) = left bottom corner
   *
   * orientation used on PDF file, and it's also the same used on the cartesian plane
   *
   * https://www.cuemath.com/geometry/cartesian-plane/
   */
  TO_RIGHT_TOP = "TO_RIGHT_TOP",

  /**
   * Position( x: 0, y: 0 ) = left top corner
   *
   * orientation used on the web
   *
   * https://www.w3schools.com/graphics/canvas_coordinates.asp
   */
  TO_RIGHT_BOTTOM = "TO_RIGHT_BOTTOM",
}

export type TCoordsOrientation = `${CoordsOrientation}`;

/** Position( x: 0, y: 0 ) = left top corner */
export const CoordsOrientationToRightBottom = CoordsOrientation.TO_RIGHT_BOTTOM;

/** Position( x: 0, y: 0 ) = left bottom corner */
export const CoordsOrientationToRightTop = CoordsOrientation.TO_RIGHT_TOP;

/** Position( x: 0, y: 0 ) = left top corner */
export const CoordsOrientationWEB = CoordsOrientation.TO_RIGHT_BOTTOM;

/** Position( x: 0, y: 0 ) = left bottom corner */
export const CoordsOrientationPDF = CoordsOrientation.TO_RIGHT_TOP;

//----------------------------------------------------------------------------//

export interface IRectangleFrame extends ISize {
  orientation?: TCoordsOrientation;
}

export interface IRectangleSpacings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type TRectangleSpacings = number | Partial<IRectangleSpacings>;

export interface IRectangle extends IPoint, IRectangleFrame {}

export interface IRectangleCoordsLimits {
  yTop: number;
  yBottom: number;
  xLeft: number;
  xRight: number;
  orientation: TCoordsOrientation;
}

//----------------------------------------------------------------------------//

export const centralizeRectangleOnSize = (
  onSize: number,
  contentSize: number
) => Math.ceil(onSize / 2) - Math.ceil(contentSize / 2);

//----------------------------------------------------------------------------//

export const getRectangleSpacings = (
  spacings: TRectangleSpacings = 0,
  scale = 1
): IRectangleSpacings => {
  if (isNumber(spacings) && spacings > 0) {
    const numberSpacing = (spacings as number) * scale;
    return {
      top: numberSpacing,
      right: numberSpacing,
      bottom: numberSpacing,
      left: numberSpacing,
    };
  }

  if (isObject(spacings)) {
    const {
      top = 0,
      right = 0,
      bottom = 0,
      left = 0,
    } = spacings as Partial<IRectangleSpacings>;
    return {
      top: top * scale,
      bottom: bottom * scale,
      right: right * scale,
      left: left * scale,
    };
  }

  return { top: 0, right: 0, bottom: 0, left: 0 };
};

//----------------------------------------------------------------------------//

interface GetRectangleCoordsLimitsOptions {
  rectangle: IRectangle;
  spacings?: TRectangleSpacings;
  scale?: number;
}

export const getRectangleCoordsLimits = ({
  rectangle,
  spacings: spacing,
  scale,
}: GetRectangleCoordsLimitsOptions): IRectangleCoordsLimits => {
  const {
    top: rectangleSpacingTop,
    right: rectanglePaddingRight,
    bottom: rectangleSpacingBottom,
    left: rectangleSpacingLeft,
  } = getRectangleSpacings(spacing, scale);

  const {
    x: rectangleX,
    y: rectangleY,
    width: rectangleWidth,
    height: rectangleHeight,
    orientation = CoordsOrientation.TO_RIGHT_BOTTOM,
  } = rectangle;

  const xLeft = rectangleX + rectangleSpacingLeft;
  const xRight = rectangleX + rectangleWidth - rectanglePaddingRight;

  if (orientation === CoordsOrientationPDF) {
    return {
      yTop: rectangleY + rectangleHeight - rectangleSpacingTop,
      yBottom: rectangleY + rectangleSpacingBottom,
      xLeft,
      xRight,
      orientation,
    };
  }

  return {
    yTop: rectangleY + rectangleSpacingTop,
    yBottom: rectangleY + rectangleHeight - rectangleSpacingBottom,
    xLeft,
    xRight,
    orientation,
  };
};

//----------------------------------------------------------------------------//

interface IGetCoordsFromFrame extends Partial<IPoint>, Partial<ISize> {
  frame: IRectangleFrame;
  scale?: number;

  /** represents the margins */
  spacings?: TRectangleSpacings;
}

/**
 *  get the positioning from a given frame size
 *
 * @param {IGetCoordsFromFrame} options
 *
 * @return {IRectangle} rectangle
 */
export const getCoordsFromFrame = ({
  x = 0,
  y = 0,
  width,
  height,
  frame,
  scale = 1,
  spacings: spacing = 0,
}: IGetCoordsFromFrame): IRectangle => {
  const {
    width: frameWidth,
    height: frameHeight,
    orientation: frameOrientation = CoordsOrientation.TO_RIGHT_BOTTOM,
  } = frame;

  const { top, right, bottom, left } = getRectangleSpacings(spacing, scale);

  x = x + left;
  y = frameOrientation === CoordsOrientationPDF ? y + bottom : y + top;

  width = (width ? width * scale : frameWidth) - (left + right);
  height = (height ? height * scale : frameHeight) - (top + bottom);

  return { x, y, width, height, orientation: frameOrientation };
};

//----------------------------------------------------------------------------//

interface GetCoordsInsideRectangleOptions
  extends Partial<IPoint>,
    Partial<ISize>,
    Partial<IRectangleSpacings> {
  scale?: number;

  rectangle: IRectangle;
  /** represents the paddings inside of the given rectangle */
  rectangleSpacings?: TRectangleSpacings;
  keepInside?: boolean;
}

/**
 * from a given rectangle, calculate an inner rectangle from the given coords
 */
export const getCoordsInsideRectangle = ({
  x,
  y,
  width = 10,
  height = 10,
  top,
  right,
  bottom,
  left,

  scale = 1,

  rectangle,
  rectangleSpacings: rectangleSpacing = 0,
  keepInside = false,
}: GetCoordsInsideRectangleOptions): IRectangle => {
  const { orientation } = rectangle;
  const { yTop, yBottom, xLeft, xRight } = getRectangleCoordsLimits({
    rectangle,
    spacings: rectangleSpacing,
    scale,
  });

  if (scale !== 1 && scale !== 0) {
    width *= scale;
    height *= scale;
  }

  let newWidth = width;
  let newHeight = height;

  let newX = xLeft + (x ?? 0);
  let newY = y ?? 0;

  if (isNumber(left) || isNumber(right)) {
    if (isNumber(left)) {
      newX = xLeft + (left as number);
    }

    if ((isNumber(left) || isNumber(x)) && isNumber(right)) {
      newWidth = xRight - newX - (right as number);
    } else if (isNumber(right)) {
      newX = xRight - (newWidth + (right as number));
    }
  }

  if (keepInside) {
    const xWidth = newX + newWidth;
    if (xWidth > xRight) {
      newWidth = newWidth - (xRight - xWidth);
    }
  }

  switch (orientation) {
    case CoordsOrientationPDF:
      newY = yTop - (newHeight + newY);

      if (isNumber(top) || isNumber(bottom)) {
        if (isNumber(bottom)) {
          newY = yBottom + (bottom as number);
        }

        if ((isNumber(bottom) || isNumber(y)) && isNumber(top)) {
          newHeight = yTop - newY - (top as number);
        } else if (isNumber(top)) {
          newY = yTop - (newHeight + (top as number));
        }
      }

      if (keepInside) {
        const yHeight = newY + newHeight;
        if (yHeight > yTop) {
          newHeight = newHeight - (yTop - yHeight);
        }
      }
      break;

    case CoordsOrientationWEB:
    default:
      newY = yTop + newY;

      if (isNumber(top) || isNumber(bottom)) {
        if (isNumber(top)) {
          newY = newY + (top as number);
        }

        if ((isNumber(top) || isNumber(y)) && isNumber(bottom)) {
          newHeight = yBottom - newY - (bottom as number);
        } else if (isNumber(bottom)) {
          newHeight = yBottom - (bottom as number);
        }
      }

      if (keepInside) {
        const yHeight = newY + newHeight;
        if (yHeight > yBottom) {
          newHeight = newHeight - (yBottom - yHeight);
        }
      }
      break;
  }

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
    orientation,
  };
};

//----------------------------------------------------------------------------//
