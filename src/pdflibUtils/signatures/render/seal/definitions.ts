import type { ISignatureRenderPosition } from "@/entities";

import type { ISize } from "@/utils/math/geometry";

//----------------------------------------------------------------------------//

export const DEFAULT_SEAL_SCALE = 0.5;

export interface ISealSize extends ISize {
  scale?: number;
}

/*
  value of the immosign seal_template.png file
  immosign-cigdl/public/media/templates/seal_template.png

  width: 480
  height: 210

  but this size is scale down by half (0.5)
 */
export const DEFAULT_SEAL_SIZE: ISealSize = {
  width: 480,
  height: 210,
  scale: 0.5,
};

export type TSealRenderPosition = ISealSize | ISignatureRenderPosition;
