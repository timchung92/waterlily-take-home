import { kebabCase } from 'lodash';
import { appModel, CareEnvironment, CarePhase } from './appModel';

export interface CareEnvironmentDef {
  key: string;
  label: string;
  dbId: number;
  slug: string;
  rationale: string;
  facilityType: string;
}

const rationaleByCareEnvironment = {
  [CareEnvironment.home]: `
      At this stage, the client may not need intensive care and might still be able to enjoy a certain degree of
      independence. Home care could involve support from caregivers in the client's home, reflecting the client's
      preference for maintaining their usual lifestyle as much as possible.
    `,
  [CareEnvironment.independentLiving]: `
      At this stage, the client might still be able to maintain a large degree of independence but may also benefit
      from a community setting that offers socialization opportunities and assistance as needed.
    `,
  [CareEnvironment.assistedLiving]: `
      This stage might demand a higher level of care that can't be sufficiently delivered at home. Assisted living
      offers a balance between independence and professional support, aligning with the client's desire for quality of
      life.
    `,
  [CareEnvironment.fullCareFacility]: `
      At this stage, the client may require round-the-clock professional care. Although this may mean a compromise on
      personal autonomy, it prioritizes the client's health and safety.
    `,
  // [CareEnvironment.hospice]:
  //   `
  //     This stage usually indicates a critical condition where the main focus is on providing comfort and quality of
  //     life, resonating with the client's wish for dignity and ease during a difficult time.
  //   `,
} as Record<CareEnvironment, string>;

const facilityTypeByCareEnvironment = {
  [CareEnvironment.home]: 'at home',
  [CareEnvironment.independentLiving]: 'in an independent living facility',
  [CareEnvironment.assistedLiving]: 'in an assisted living facility',
  [CareEnvironment.fullCareFacility]: 'in a full care facility',
  // [CareEnvironment.hospice]:
  //   `
  //     This stage usually indicates a critical condition where the main focus is on providing comfort and quality of
  //     life, resonating with the client's wish for dignity and ease during a difficult time.
  //   `,
} as Record<CareEnvironment, string>;

export const careEnvironmentList: CareEnvironmentDef[] = Object.entries(
  appModel.tablesByName.careEnvironments.valuesByLabel,
).map(([label, dbId]) => ({
  key: CareEnvironment[dbId],
  label,
  dbId,
  slug: kebabCase(label),
  rationale: rationaleByCareEnvironment[dbId as CareEnvironment],
  facilityType: facilityTypeByCareEnvironment[dbId as CareEnvironment],
}));

export const careEnvironmentDefs = careEnvironmentList.reduce(
  (lookup, careEnvironment) => {
    Object.values(careEnvironment).forEach(
      value => (lookup[value] = careEnvironment),
    );

    return lookup;
  },
  {} as ObjectMap<CareEnvironmentDef>,
);

export const careEnvironmentsApplicableToPhase = {
  [CarePhase.earlyCare]: [
    careEnvironmentDefs[CareEnvironment.home],
    careEnvironmentDefs[CareEnvironment.independentLiving],
  ],
  [CarePhase.moderateCare]: [
    careEnvironmentDefs[CareEnvironment.home],
    careEnvironmentDefs[CareEnvironment.assistedLiving],
  ],
  [CarePhase.fullCare]: [
    careEnvironmentDefs[CareEnvironment.home],
    careEnvironmentDefs[CareEnvironment.fullCareFacility],
  ],
};
