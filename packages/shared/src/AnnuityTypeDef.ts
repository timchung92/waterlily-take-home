import { toRecord } from "./toRecord";
import { AnnuityType } from "./appModel";

export interface AnnuityTypeDef {
  value: AnnuityType;
  key: 'basicAnnuity'
  label: string;
}

export const AnnuityTypeDefList: AnnuityTypeDef[] = [
  {
    value: AnnuityType.basicAnnuity,
    key: 'basicAnnuity',
    label: 'Basic Annuity',
  },
];

export const annuityTypeDefs = Object.assign(
  toRecord(AnnuityTypeDefList, annuityType => annuityType.value),
  toRecord(AnnuityTypeDefList, annuityType => annuityType.key),
  toRecord(AnnuityTypeDefList, annuityType => annuityType.label),
);