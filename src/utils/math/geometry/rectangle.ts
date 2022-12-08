import { isNumber, isObject } from "@/utils/data/is";

//----------------------------------------------------------------------------//

export interface IRectangleSpacings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type TRectangleSpacings = number | Partial<IRectangleSpacings>;

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
