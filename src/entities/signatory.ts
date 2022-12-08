import type { ISignatureRenderPosition } from "./signatures";

//---===---//

import {
  getRandomInt,
  getRandomName,
  getRandomCityName,
} from "@/utils/data/random";

//----------------------------------------------------------------------------//

export interface Signatory {
  fullName: string;

  signatureRenderPosition?: ISignatureRenderPosition;
  signedLocation?: string;
  signedDate?: Date;
}

//----------------------------------------------------------------------------//

export const buildSignatory = (nameSize?: number): Signatory => {
  const fullName = getRandomName(nameSize);
  const signedLocation = getRandomCityName();
  const days = getRandomInt(0, 5);
  const signedDate = new Date();
  if (days > 0) {
    signedDate.setDate(signedDate.getDate() - days);

    const randomHour = getRandomInt(0, 23);
    const randomMin = getRandomInt(0, 59);
    const randomSec = getRandomInt(0, 59);

    signedDate.setHours(randomHour, randomMin, randomSec);
  }

  return {
    fullName,
    signedLocation,
    signedDate,
  };
};

export const generateSignatories = (min = 3, max = 15, nameSize?: number) => {
  const amount = getRandomInt(min, max);
  const signatories = [];
  for (let i = 0; i < amount; i++) {
    signatories.push(buildSignatory(nameSize));
  }
  return signatories;
};
