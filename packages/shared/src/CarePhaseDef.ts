import { toRecord } from './toRecord';
import { CarePhase } from './appModel';

export interface CarePhaseDef {
  index: number;
  value: CarePhase;
  key: 'earlyCare' | 'moderateCare' | 'fullCare';
  label: string;
  slug: string;
  tooltip: string;
}

export const carePhaseDefList: CarePhaseDef[] = [
  {
    index: 0,
    value: CarePhase.earlyCare,
    key: CarePhase[CarePhase.earlyCare] as CarePhaseDef['key'],
    label: 'Early Care',
    slug: 'early-care',
    tooltip: '1-2 Basic Self-Care Tasks',
  },
  {
    index: 1,
    value: CarePhase.moderateCare,
    key: CarePhase[CarePhase.moderateCare] as CarePhaseDef['key'],
    label: 'Moderate Care',
    slug: 'moderate-care',
    tooltip: '3-4 Basic Self-Care Tasks',
  },
  {
    index: 2,
    value: CarePhase.fullCare,
    key: CarePhase[CarePhase.fullCare] as CarePhaseDef['key'],
    label: 'Full Care',
    slug: 'full-care',
    tooltip: '5-6 Basic Self-Care Tasks',
  },
];

export const carePhaseDefs = Object.assign(
  toRecord(carePhaseDefList, carePhase => carePhase.value),
  toRecord(carePhaseDefList, carePhase => carePhase.key),
  toRecord(carePhaseDefList, carePhase => carePhase.label),
  toRecord(carePhaseDefList, carePhase => carePhase.slug),
);

export function chooseByCarePhase<T>(
  carePhase: CarePhase,
  earlyCareValue: T,
  moderateCareValue: T,
  fullCareValue: T,
) {
  return carePhase === CarePhase.earlyCare
    ? earlyCareValue
    : carePhase === CarePhase.moderateCare
      ? moderateCareValue
      : fullCareValue;
}
