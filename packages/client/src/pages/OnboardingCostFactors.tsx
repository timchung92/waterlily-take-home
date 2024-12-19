import { useSelector } from 'react-redux';
import { OnboardingChrome } from '../components';
import { selectClient } from '../model';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { formatCurrency } from '@shared/formatCurrency';
import { SlideContent } from '../components/SlideContent';
import { getFirstCarePhasePage } from '../util/navigationLogic';
import {  OnboardingResultsAreIn, cn } from '..';
import FormattedList from '@/components/FormattedList';
import {
  annualHealthcareInflationRate,
  formatPercent,
  formatThousands,
  getRateLocaleType,
  getState,
  isValidState,
  CarePhase,
  isDurationCustom,
} from '@shared';
import {
  CalendarFoldIcon,
  CalendarHeartIcon,
  ChartNoAxesCombinedIcon,
  CheckIcon,
  CircleDollarSignIcon,
  FileCheckIcon,
  HeartHandshakeIcon,
  LandmarkIcon,
  MapPinHouseIcon,
  TagIcon,
} from 'lucide-react';

export function OnboardingCostFactors({ clientId }: ClientIdProps) {
  const client = useSelector(selectClient)!;
  const {
    clientFirstName,
    allPhaseCosts: { allPhaseInflatedProfessionalShareCost },
    intakeSurvey: { clientHasStartedLtc },
  } = client;

  return (
    <OnboardingChrome
      slidePage={OnboardingCostFactors}
      nextButtonLabel={`Refine ${clientFirstName}'s Cost`}
      nextSlidePage={getFirstCarePhasePage(client)}
      previousSlidePage={
        clientHasStartedLtc ? OnboardingResultsAreIn : undefined
      }
    >
      <SlideContent
        headerText={
          <>
            {clientFirstName}&apos;s{' estimated '}
            {clientHasStartedLtc ? 'remaining ' : ''} long-term care costs
          </>
        }
      >
        <div className="mb-8 mt-8">
          <p className="w-full text-right text-sm text-gray-600">
            Expand for detail
          </p>
          <CostFactorAccordion className="mb-4 mt-2" />
          <div className="flex justify-between">
            <label className="flex flex-col text-lg text-darkPurple md:text-2xl">
              Estimated total costs
              <p className="whitespace-nowrap text-base text-gray-500 md:text-lg">
                *without a funding plan
              </p>
            </label>
            <p className="mr-11 text-xl font-semibold text-darkPurple md:text-2xl">
              {formatCurrency(allPhaseInflatedProfessionalShareCost)}
            </p>
          </div>
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}

type CostFactorAccordionProps = {
  className?: string;
};

function CostFactorAccordion({ className }: CostFactorAccordionProps) {
  const client = useSelector(selectClient)!;
  const {
    allPhaseCosts: {
      allPhaseTotalCost,
      allPhaseInflatedFamilyCareCost,
      allPhaseInflatedProfessionalShareCost,
      allPhaseCareMonthsNeeded,
      allPhaseFamilyProvidedPercent,
      allPhaseFamilyCareHoursProvided,
    },
    intakeSurvey: {
      clientZipCode,
      clientLtcZipCode,
      clientIndependencePreference,
      clientFinancialSecurityPreference,
      clientFamilyInvolvementPreference,
      clientHasStartedLtc,
    },
    clientFirstName,
    clientPhasePredictedEndYears,
    phaseCosts,
  } = client;

  const allPhaseInflatedCost =
    allPhaseInflatedProfessionalShareCost + allPhaseInflatedFamilyCareCost;
  const healthCareInflationContribution =
    allPhaseInflatedCost - allPhaseTotalCost;

  const careDurationEdited = isDurationCustom(phaseCosts);

  const costFactorsData = [
    {
      id: 1,
      title: `${clientHasStartedLtc ? 'Cost of Remaining Care' : 'Cost of Care'}`,
      cost: allPhaseTotalCost,
      changeType: 'increase',
    },
    {
      id: 2,
      title: 'Healthcare Inflation',
      cost: healthCareInflationContribution,
      changeType: 'increase',
    },
    {
      id: 3,
      title: 'Family Caregiving',
      cost: allPhaseInflatedFamilyCareCost,
      changeType: 'decrease',
      isLast: true,
    },
  ];
  return (
    <Accordion
      type="single"
      collapsible
      className={className}
    >
      {costFactorsData.map(costFactor => (
        <AccordionItem
          key={costFactor.id}
          value={`item-${costFactor.id}`}
          className={cn(`${costFactor.isLast ? 'border-b-4' : ''}`)}
        >
          <AccordionTrigger>
            <AccordionTriggerContent
              title={costFactor.title}
              cost={costFactor.cost}
              changeType={costFactor.changeType as 'increase' | 'decrease'}
            />
          </AccordionTrigger>
          <AccordionContent className="text-base md:text-lg">
            {costFactor.id === 1 && (
              <div className="">
                <h2 className="mb-1 text-base text-gray-500">
                  Some of {clientFirstName}'s cost factors:
                </h2>
                <FormattedList
                  items={getCareSettingsContent(
                    clientFirstName,
                    clientLtcZipCode ?? clientZipCode,
                    allPhaseCareMonthsNeeded / 12,
                    clientIndependencePreference,
                    clientFinancialSecurityPreference,
                    clientHasStartedLtc,
                    careDurationEdited,
                  )}
                  className="p-2"
                />
              </div>
            )}
            {costFactor.id === 2 && (
              <div className="space-y-1">
                <h2 className="mb-1 text-base text-gray-500">
                  The total projected cost increase is calculated using:
                </h2>
                <FormattedList
                  items={getHealthcareInflationContent(
                    allPhaseTotalCost,
                    Math.round(
                      clientPhasePredictedEndYears[CarePhase.fullCare]!,
                    ),
                    annualHealthcareInflationRate,
                    healthCareInflationContribution,
                  )}
                  className="p-2"
                />
                <a
                  href="https://www.cms.gov/newsroom/press-releases/cms-office-actuary-releases-2022-2031-national-health-expenditure-projections"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FootNote
                    text="1. 2023 Center for Medicare & Medicaid Services (CMS) Office
                  of the Actuary, National Health Expenditure Projections"
                  />
                </a>
                <FootNote
                  text="2. This simplified explanation is for educational purposes only and may slightly overestimate the actual calculation used to estimate cost."
                  className="-translate-y-1"
                />
              </div>
            )}
            {costFactor.id === 3 && (
              <div className="space-y-1">
                <h2 className="mb-1 text-base text-gray-500">
                  Family caregiving estimates based on client preferences and
                  family structure.{' '}
                </h2>
                <FormattedList
                  items={getFamilyInvolvementContent(
                    clientFirstName,
                    clientFamilyInvolvementPreference,
                    allPhaseFamilyProvidedPercent,
                    allPhaseFamilyCareHoursProvided,
                    allPhaseInflatedFamilyCareCost,
                    clientLtcZipCode ?? clientZipCode,
                  )}
                  className="p-2"
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function FootNote({ text, className }: { text: string; className?: string }) {
  return (
    <p
      className={cn(
        'inline-block text-xs leading-snug text-gray-400',
        className,
      )}
    >
      {text}
    </p>
  );
}

type AccordionTriggerContentProps = {
  title: string;
  cost: number;
  changeType: 'increase' | 'decrease';
};

function AccordionTriggerContent({
  title,
  cost,
  changeType,
}: AccordionTriggerContentProps) {
  return (
    <div className="flex w-full items-center justify-between text-lg font-normal md:text-2xl">
      <div className="text-left text-gray-900">
        <span className=" text-gray-700">{title}</span>
      </div>
      <div className="flex h-7 items-center px-6">
        {changeType === 'decrease' ? (
          <span className=" text-green-700 ">-{formatCurrency(cost)}</span>
        ) : (
          <span className=" text-red-700 ">+{formatCurrency(cost)}</span>
        )}
      </div>
    </div>
  );
}

const getHealthcareInflationContent = (
  currentCost: number,
  projectedEndYear: number,
  inflationRate: number,
  healthCareInflationContribution: number,
) => [
  {
    label: `Current cost: `,
    value: formatCurrency(currentCost),
    icon: <TagIcon className="h-4 w-4" />,
  },
  {
    label: `Projected care end year: `,
    value: projectedEndYear,
    icon: <CalendarHeartIcon className="h-4 w-4" />,
  },
  {
    label: 'Healthcare inflation (CMS)¹: ',
    value: `${formatPercent(inflationRate, 1)} annually`,
    icon: <LandmarkIcon className="h-4 w-4" />,
  },
  {
    label: 'Future projected cost²: ',
    value: formatCurrency(currentCost + healthCareInflationContribution),
    icon: <ChartNoAxesCombinedIcon className="h-4 w-4" />,
  },
];

const getCareSettingsContent = (
  clientFirstName: string,
  zipCode: string,
  ltcDurationYears: number,
  clientIndependencePreference: string,
  clientFinancialSecurityPreference: string,
  clientHasStartedLtc: boolean,
  careDurationEdited: boolean,
) => [
  {
    label: `${careDurationEdited ? 'Edited' : 'Projected'}  care timeline`,
    value: `${formatThousands(ltcDurationYears, '', 1)} years ${clientHasStartedLtc ? 'remaining' : ''}`,
    icon: <CalendarFoldIcon className="h-4 w-4" />,
  },
  {
    label: 'Market rates for care in ',
    value: `${localCostString(zipCode)}`,
    icon: <MapPinHouseIcon className="h-4 w-4" />,
  },
  {
    label: `${clientFirstName}'s preferences:`,
    subItems: [clientIndependencePreference, clientFinancialSecurityPreference],
    icon: <FileCheckIcon className="h-4 w-4" />,
    subBulletIcon: <CheckIcon className="h-3 w-3" />,
  },
];

const getFamilyInvolvementContent = (
  clientFirstName: string,
  clientFamilyInvolvementPreference: string,
  allPhaseFamilyProvidedPercent: number,
  allPhaseFamilyCareHoursProvided: number,
  allPhaseInflatedFamilyCareCost: number,
  zipCode: string,
) => [
  {
    label: `${clientFirstName}'s preferences: `,
    subItems: [`${clientFamilyInvolvementPreference}`],
    icon: <FileCheckIcon className="h-4 w-4" />,
    subBulletIcon: <CheckIcon className="h-3 w-3" />,
  },
  {
    label: 'Projected family caregiving: ',
    value: `${formatThousands(allPhaseFamilyCareHoursProvided, '', 0)} hours (${formatPercent(allPhaseFamilyProvidedPercent, 1)} of care needs)`,
    icon: <HeartHandshakeIcon className="h-4 w-4" />,
  },
  {
    label: 'Projected value of care provided by family: ',
    value: `${formatCurrency(allPhaseInflatedFamilyCareCost)}`,
    icon: <CircleDollarSignIcon className="h-4 w-4" />,
  },
  {
    label: 'Based on market rates for home care in ',
    value: `${localCostString(zipCode)}`,
    icon: <MapPinHouseIcon className="h-4 w-4" />,
  },
];

function localCostString(zipCode: string) {
  const localeType = getRateLocaleType(zipCode);
  switch (localeType) {
    case 'National':
      return 'the US';
    case 'State':
      const state = getState(zipCode);
      if (isValidState(state)) {
        return state;
      }
      return 'your state';
    case 'Local':
      return `zip code ${zipCode}`;
  }
}
