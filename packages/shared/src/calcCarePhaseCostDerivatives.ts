import { Draft } from 'immer';
import { sum } from 'lodash';
import { CareEnvironment, CarePhase } from './appModel';
import {
  chooseByCarePhase,
  carePhaseDefList,
  CarePhaseDef,
} from './CarePhaseDef';
import { isFamily } from './isFamily';
import { SupportProviderRatePeriod } from './SupportProviderRatePeriod';
import { toObjectMap } from './toObjectMap';
import {
  calcCarePhaseDerivatives,
  calcFutureValue,
  isNullOrUndefined,
  isProfessional,
  pickClientCareEnvironmentCosts,
} from '.';
import { annualHealthcareInflationRate } from '.';

const phaseSumKeys: (keyof SummableSinglePhaseCosts)[] = [
  'phaseCareHoursNeeded',
  'phaseCareMonthsNeeded',
  'phaseCareHoursProvided',
  'phaseCareHoursGap',
  'phaseCarePeriodNeeded',
  'phaseTotalCost',
  'phaseFamilyCareHoursProvided',
  'phaseFamilyCareCost',
  'phaseProfessionalCareHoursProvided',
  'phaseProfessionalShareCost',
  'phaseInflatedProfessionalShareCost',
  'phaseInflatedFamilyCareCost',
];

export function calcCarePhaseCostDerivatives(mutableClient: Draft<Client>) {
  calcPhaseCosts(mutableClient);
  calcCarePhaseDerivatives(mutableClient);
  calcInflatedCarePhaseCosts(mutableClient);
  calcFamilyCareHoursRatios(mutableClient);
  calcAllPhaseCosts(mutableClient);
  calcProfessionalSupportProviderAppliedHours(mutableClient);
}

function calcPhaseCosts(mutableClient: Client) {
  mutableClient.phaseCosts = carePhaseDefList.map(carePhaseDef =>
    calcSinglePhaseCosts(mutableClient, carePhaseDef),
  );
}

function calcSinglePhaseCosts(
  mutableClient: Client,
  carePhaseDef: CarePhaseDef,
): SinglePhaseCosts {
  const { appliedInferenceSet, supportProviderSet } = mutableClient;

  const carePhase = carePhaseDef.value;
  const appliedCareEnvironment =
    mutableClient.appliedCareEnvironments[carePhase];
  const recommendedCareEnvironment =
    mutableClient.recommendedCareEnvironments[carePhase];

  const {
    phaseOneCareHoursRatio,
    phaseTwoCareHoursRatio,
    phaseThreeCareHoursRatio,
    phaseOneDurationYearsRatio,
    phaseTwoDurationYearsRatio,
    phaseThreeDurationYearsRatio,
  } = appliedInferenceSet;

  const { supportProviders } = supportProviderSet;

  const familySupportProviders = supportProviders.filter(isFamily);

  const phaseCareHoursRatio = chooseByCarePhase(
    carePhase,
    phaseOneCareHoursRatio,
    phaseTwoCareHoursRatio,
    phaseThreeCareHoursRatio,
  );

  const phaseDurationRatio = chooseByCarePhase(
    carePhase,
    phaseOneDurationYearsRatio,
    phaseTwoDurationYearsRatio,
    phaseThreeDurationYearsRatio,
  );

  const inHomeEnvironment = appliedCareEnvironment === CareEnvironment.home;

  const { phaseCareHoursNeeded, phaseCareMonthsNeeded, isDurationCustom } =
    calcPhaseCareNeeded(
      mutableClient,
      phaseCareHoursRatio,
      phaseDurationRatio,
      carePhase,
    );

  const { rateAmount, ratePeriod } = pickClientCareEnvironmentCosts(
    mutableClient,
    appliedCareEnvironment,
  );

  const phaseCarePeriodNeeded =
    ratePeriod.toLowerCase() === SupportProviderRatePeriod.hourly.toLowerCase()
      ? phaseCareHoursNeeded
      : phaseCareMonthsNeeded;

  const phaseTotalCost = phaseCarePeriodNeeded * rateAmount;
  const phaseFamilyCareHoursProvided = calcPhaseCareHoursProvided(
    familySupportProviders,
    carePhase,
  );
  const phaseCareHoursProvided = Math.max(
    phaseFamilyCareHoursProvided,
    phaseCareHoursNeeded,
  ); // Family can provide a surplus
  const phaseProfessionalCareHoursProvided = Math.max(
    0,
    phaseCareHoursNeeded - phaseFamilyCareHoursProvided,
  );
  const phaseCareHoursGap = phaseCareHoursNeeded - phaseCareHoursProvided; // never a gap anymore, but could be surplus

  const phaseProfessionalShareCost = inHomeEnvironment
    ? phaseProfessionalCareHoursProvided * rateAmount // Note: for in-home rate period is always hourly
    : phaseTotalCost;

  const phaseFamilyCareCost = phaseTotalCost - phaseProfessionalShareCost;

  const carePhaseCosts: SinglePhaseCosts = {
    phaseCareHoursNeeded,
    phaseCareMonthsNeeded,
    phaseCareHoursProvided,
    phaseCareHoursGap,
    phaseCarePeriodNeeded,
    phaseTotalCost,
    phaseProfessionalCareHoursProvided,
    phaseProfessionalShareCost,
    phaseFamilyCareHoursProvided,
    phaseFamilyCareCost,
    phaseCareHoursRatio,
    phaseDurationRatio,
    carePhase,
    appliedCareEnvironment,
    recommendedCareEnvironment,
    inHomeEnvironment,
    isDurationCustom,

    // Filled-in later
    familyCareHoursRatio: 0,
    phaseCareProvidedPercent: 0,
    phaseFamilyProvidedPercent: 0,
    phaseInflatedProfessionalShareCost: 0,
    phaseInflatedFamilyCareCost: 0,
  };

  calcPhaseCareHoursPercents(carePhaseCosts);

  return carePhaseCosts;
}

type PhaseCareNeeded = {
  phaseCareHoursNeeded: number;
  phaseCareMonthsNeeded: number;
  isDurationCustom: boolean;
};

function calcPhaseCareNeeded(
  mutableClient: Draft<Client>,
  phaseCareHoursRatio: number,
  phaseDurationRatio: number,
  carePhase: CarePhase,
): PhaseCareNeeded {
  const {
    appliedInferenceSet: { ltcDurationYears, totalCareHoursNeeded },
    carePhaseDurationSelections,
  } = mutableClient;

  // care phase is in the past
  if (phaseCareHoursRatio === 0 && phaseDurationRatio === 0) {
    return {
      phaseCareHoursNeeded: 0,
      phaseCareMonthsNeeded: 0,
      isDurationCustom: false,
    };
  }

  // If the user has selected a duration, use that, otherwise calculate it
  const phaseCareMonthsSelected = carePhaseDurationSelections[carePhase];
  const phaseCareMonthsPredicted = Math.max(
    Math.round(ltcDurationYears * phaseDurationRatio * 12),
    1,
  );

  const phaseCareMonthsNeeded =
    phaseCareMonthsSelected ?? phaseCareMonthsPredicted;

  // If the user has selected a duration, multiply the average care hours per month by that, otherwise use predicted
  const phaseCareHoursPredicted = Math.round(
    totalCareHoursNeeded * phaseCareHoursRatio,
  );
  const phaseCareHoursPerMonthPredicted =
    phaseCareHoursPredicted / phaseCareMonthsPredicted ?? 0;
  const phaseCareHoursNeeded = !isNullOrUndefined(phaseCareMonthsSelected)
    ? phaseCareHoursPerMonthPredicted * phaseCareMonthsSelected
    : phaseCareHoursPredicted;

  const isDurationCustom = phaseCareMonthsNeeded !== phaseCareMonthsPredicted;

  return {
    phaseCareHoursNeeded: Math.round(phaseCareHoursNeeded),
    phaseCareMonthsNeeded: Math.round(phaseCareMonthsNeeded),
    isDurationCustom,
  };
}

function calcInflatedCarePhaseCosts(mutableClient: Client) {
  const {
    phaseCosts,
    intakeSurvey: { clientHasStartedLtc },
    clientYearsTillPhaseEnd,
  } = mutableClient;

  phaseCosts.forEach(phaseCosts => {
    // past phase
    const { carePhase } = phaseCosts;
    if (clientHasStartedLtc && clientYearsTillPhaseEnd[carePhase] === null) {
      phaseCosts.phaseInflatedProfessionalShareCost =
        phaseCosts.phaseProfessionalShareCost;
      phaseCosts.phaseInflatedFamilyCareCost = phaseCosts.phaseFamilyCareCost;
      return;
    }

    phaseCosts.phaseInflatedProfessionalShareCost = calcFutureValue(
      phaseCosts.phaseProfessionalShareCost,
      annualHealthcareInflationRate,
      clientYearsTillPhaseEnd[carePhase] ?? 0,
    );
    phaseCosts.phaseInflatedFamilyCareCost = calcFutureValue(
      phaseCosts.phaseFamilyCareCost,
      annualHealthcareInflationRate,
      clientYearsTillPhaseEnd[carePhase] ?? 0,
    );
  });
}

function calcPhaseCareHoursProvided(
  supportProviders: SupportProvider[],
  carePhase: CarePhase,
) {
  return supportProviders.reduce(
    (hoursProvided, supportProvider) =>
      hoursProvided +
      chooseByCarePhase(
        carePhase,
        supportProvider.supportProviderAppliedPhaseOneHours,
        supportProvider.supportProviderAppliedPhaseTwoHours,
        supportProvider.supportProviderAppliedPhaseThreeHours,
      ),
    0,
  );
}

function calcFamilyCareHoursRatios(mutableClient: Client) {
  const { phaseCosts } = mutableClient;
  const sumHomeEnvironmentRatios = sum(
    phaseCosts.map(({ phaseCareHoursRatio, inHomeEnvironment }) =>
      inHomeEnvironment ? phaseCareHoursRatio : 0,
    ),
  );

  phaseCosts.forEach(phaseCosts => {
    phaseCosts.familyCareHoursRatio = phaseCosts.inHomeEnvironment
      ? phaseCosts.phaseCareHoursRatio / sumHomeEnvironmentRatios
      : 0;
  });
}

function calcAllPhaseCosts(mutableClient: Client) {
  const { phaseCosts } = mutableClient;

  const aggregateEachPhaseCosts = phaseCosts.reduce(
    (sumPhaseCosts, singlePhaseCosts) => {
      phaseSumKeys.forEach(
        key =>
          (sumPhaseCosts[key] =
            (sumPhaseCosts[key] ?? 0) + singlePhaseCosts[key]),
      );
      return sumPhaseCosts;
    },
    {} as SummableSinglePhaseCosts & RecalculateSinglePhaseCosts,
  );

  calcPhaseCareHoursPercents(aggregateEachPhaseCosts);

  const allPhaseCosts = (mutableClient.allPhaseCosts = toObjectMap(
    Object.entries(aggregateEachPhaseCosts),
    ([key]) => `allP${key.substring(1)}`,
    ([, value]) => value,
  ) as unknown as AllPhaseCosts);

  allPhaseCosts.allPhaseHomeCareHoursProvided = 0;
  allPhaseCosts.allPhaseHomeProfessionalCareHoursProvided = 0;
  allPhaseCosts.allPhaseHomeCareHoursNeeded = 0;

  phaseCosts
    .filter(({ inHomeEnvironment }) => inHomeEnvironment)
    .forEach(
      ({
        phaseCareHoursNeeded,
        phaseCareHoursProvided,
        phaseProfessionalCareHoursProvided,
      }) => {
        allPhaseCosts.allPhaseHomeCareHoursNeeded += phaseCareHoursNeeded;
        allPhaseCosts.allPhaseHomeCareHoursProvided += phaseCareHoursProvided;
        allPhaseCosts.allPhaseHomeProfessionalCareHoursProvided +=
          phaseProfessionalCareHoursProvided;
      },
    );
}

function calcPhaseCareHoursPercents(
  costs: SummableSinglePhaseCosts & RecalculateSinglePhaseCosts,
) {
  const {
    phaseCareHoursNeeded,
    phaseCareHoursProvided,
    phaseFamilyCareHoursProvided,
  } = costs;

  costs.phaseCareProvidedPercent = phaseCareHoursNeeded
    ? Math.min(1, phaseCareHoursProvided / phaseCareHoursNeeded)
    : 1;

  costs.phaseFamilyProvidedPercent = Math.min(
    1,
    phaseFamilyCareHoursProvided / phaseCareHoursProvided,
  );
}

function calcProfessionalSupportProviderAppliedHours(mutableClient: Client) {
  const [
    { phaseProfessionalCareHoursProvided: supportProviderAppliedPhaseOneHours },
    { phaseProfessionalCareHoursProvided: supportProviderAppliedPhaseTwoHours },
    {
      phaseProfessionalCareHoursProvided: supportProviderAppliedPhaseThreeHours,
    },
  ] = mutableClient.phaseCosts;

  const [professionalSupportProvider, ...otherProfessionalSupportProviders] =
    mutableClient.supportProviderSet.supportProviders.filter(isProfessional);

  professionalSupportProvider.supportProviderAllPhaseCareHours =
    (professionalSupportProvider.supportProviderAppliedPhaseOneHours =
      supportProviderAppliedPhaseOneHours) +
    (professionalSupportProvider.supportProviderAppliedPhaseTwoHours =
      supportProviderAppliedPhaseTwoHours) +
    (professionalSupportProvider.supportProviderAppliedPhaseThreeHours =
      supportProviderAppliedPhaseThreeHours);

  // we don't really support multiple professional support providers right now, so for safety blanking them out.
  otherProfessionalSupportProviders.forEach(
    otherProfessionalSupportProvider => {
      otherProfessionalSupportProvider.supportProviderAllPhaseCareHours = 0;
      otherProfessionalSupportProvider.supportProviderAppliedPhaseOneHours = 0;
      otherProfessionalSupportProvider.supportProviderAppliedPhaseTwoHours = 0;
      otherProfessionalSupportProvider.supportProviderAppliedPhaseThreeHours = 0;
    },
  );
}
