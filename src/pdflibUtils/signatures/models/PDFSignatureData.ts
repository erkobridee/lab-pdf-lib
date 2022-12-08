import { sha256 } from "@/utils/data";

export interface IPDFSignatureDataProps {
  name: string;
  date: Date | string;
  location?: string;
}

export const hashPDFSignatureDataProps = (props: IPDFSignatureDataProps) =>
  sha256(props);

export interface IPDFSignatureData {
  name: string;
  date: string;
  location: string;
  hash: string;
  sizedHash: string;
}

export abstract class PDFSignatureData implements IPDFSignatureData {
  name: string;
  date: string;
  location: string;
  hash: string;
  sizedHash: string;

  constructor({ name, date, location }: IPDFSignatureDataProps) {
    const jsDate = new Date(date);

    this.name = name;
    this.date = `Signing date: ${jsDate.toISOString()}`;

    this.location = location ? `Signing location: ${location}` : "";

    this.hash = hashPDFSignatureDataProps({ name, date, location });
    this.sizedHash = `${this.hash.substring(0, 14)}...`.toUpperCase();
  }
}

export default PDFSignatureData;
