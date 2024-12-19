import { useSelector } from 'react-redux';
import { CustomizePlanButtonGroup, OnboardingChrome } from '../components';
import { selectClient } from '../model';
import { SlideContent } from '../components/SlideContent';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DomainAddOutlinedIcon from '@mui/icons-material/DomainAddOutlined'; // nursing home
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'; // independent living
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined'; // assisted living
import CreateIcon from '@mui/icons-material/Create';

import {
  carePhaseDefs,
  CarePhase,
  careEnvironmentDefs,
  carePhaseDefList,
  formatCurrency,
  formatThousands,
  CareEnvironment,
  formatPercent,
  pickClientCareEnvironmentCosts,
  getRateLocaleDescription,
} from '@shared';
import { OnboardingCareSettingsPhaseThree } from '.';
import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CareEnvironmentCostModal from '../components/CareEnvironmentCostModal';

export function OnboardingCarePhasesSummary({ clientId }: ClientIdProps) {
  const client = useSelector(selectClient)!;
  const {
    phaseCosts,
    appliedCareEnvironments,
    clientPhaseInflationFactors,
    clientYearsTillPhaseEnd,
    intakeSurvey: { clientLtcZipCode },
    allPhaseCosts: { allPhaseInflatedProfessionalShareCost },
  } = client;

  const [openEditCostModal, setOpenEditCostModal] = useState(false);
  const [selectedCareEnvironment, setSelectedCareEnvironment] =
    useState<CareEnvironment | null>(null);

  const handleEditCostClick = (careEnvironment: CareEnvironment) => {
    setSelectedCareEnvironment(careEnvironment);
    setOpenEditCostModal(true);
  };

  const carePhaseData = carePhaseDefList.map(phase => {
    const singlePhaseCosts = phaseCosts[phase.index];
    const phaseLabel = carePhaseDefs[phase.value].label;
    const yearsTillPhaseEnd = clientYearsTillPhaseEnd[phase.value];
    const {
      inHomeEnvironment,
      phaseInflatedProfessionalShareCost,
      phaseCareMonthsNeeded,
      phaseProfessionalCareHoursProvided,
    } = singlePhaseCosts;
    const phaseInflationFactor = clientPhaseInflationFactors[phase.value];
    const careEnvironment = appliedCareEnvironments[phase.value];
    const careEnvironmentLabel = careEnvironmentDefs[careEnvironment].label;
    const isDurationCustom = singlePhaseCosts.isDurationCustom;
    const { rateAmount, hasCustomRate } = pickClientCareEnvironmentCosts(
      client,
      careEnvironment,
    );
    return {
      id: phase.index,
      phaseLabel,
      phaseInflatedProfessionalShareCost,
      careEnvironment,
      careEnvironmentLabel,
      rateAmount,
      hasCustomRate,
      phaseCareMonthsNeeded,
      phaseProfessionalCareHoursProvided,
      phaseInflationFactor,
      inHomeEnvironment,
      yearsTillPhaseEnd,
      isDurationCustom,
    };
  });

  const multSign = (
    <div className="mt-1 flex flex-grow basis-[5%] flex-col items-center text-lg font-light">
      x
    </div>
  );
  const equalSign = (
    <div className="mx-auto mt-1 flex flex-grow basis-[5%]  flex-col items-center text-lg font-light">
      =
    </div>
  );

  const iconPicker = (careEnvironment: CareEnvironment) => {
    switch (careEnvironment) {
      case CareEnvironment.home:
        return (
          <HomeOutlinedIcon
            fontSize="large"
            sx={{
              paddingBottom: '2px',
              stroke: '#ffffff',
              strokeWidth: 1,
            }}
          />
        );
      case CareEnvironment.fullCareFacility:
        return (
          <DomainAddOutlinedIcon
            fontSize="large"
            sx={{
              paddingTop: '4px',
              paddingBottom: '4px',
              stroke: '#ffffff',
              strokeWidth: 1,
            }}
          />
        );
      case CareEnvironment.assistedLiving:
        return (
          <AddHomeWorkOutlinedIcon
            fontSize="large"
            sx={{
              paddingTop: '4px',
              paddingBottom: '4px',
              stroke: '#ffffff',
              strokeWidth: 1,
            }}
          />
        );
      case CareEnvironment.independentLiving:
        return (
          <HomeWorkOutlinedIcon
            fontSize="large"
            sx={{
              paddingTop: '4px',
              paddingBottom: '4px',
              stroke: '#ffffff',
              strokeWidth: 1,
            }}
          />
        );
    }
  };

  return (
    <OnboardingChrome
      slidePage={OnboardingCarePhasesSummary}
      nextButtonLabel={``}
      previousSlidePage={
        appliedCareEnvironments[CarePhase.fullCare] === CareEnvironment.home
          ? undefined // default to previous slide
          : OnboardingCareSettingsPhaseThree // skip to care settings
      }
      shouldHideNextNavigation={true}
    >
      <SlideContent headerText={'Cost Total'}>
        <CustomizePlanButtonGroup
          client={client}
          className="my-5 lg:mb-10"
          showDisqualifyingConditionsBtn={false}
        />
        <dl className="space-y-6 divide-y divide-gray-900/10 md:mt-14">
          {carePhaseData.map(phase => {
            if (phase.yearsTillPhaseEnd) {
              return (
                <Disclosure
                  as="div"
                  key={phase.id}
                  className="pt-6"
                >
                  {({ open }) => (
                    <>
                      <dt>
                        <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                          <div className="flex w-full gap-5 md:grid md:grid-cols-8 md:grid-rows-1 md:gap-5">
                            <div
                              id="mobile version"
                              className="md:hidden"
                            >
                              <div className="col-span-1 row-span-1 basis-6 text-lg font-semibold md:col-span-2 md:text-2xl">
                                {phase.phaseLabel}
                              </div>
                              <div className="basis-6 gap-1 text-lg font-light md:col-span-3 md:flex md:text-2xl">
                                <span className="hidden md:flex">
                                  {iconPicker(phase.careEnvironment)}
                                </span>

                                {phase.careEnvironmentLabel}
                              </div>
                            </div>

                            {/* only shown for md lg screens. kind of hacky */}
                            <div className="hidden text-lg font-semibold md:col-span-2 md:row-span-1 md:flex md:basis-6 md:text-2xl">
                              {phase.phaseLabel}
                            </div>
                            <div className="hidden basis-6 gap-1 text-lg font-light md:col-span-3 md:flex md:text-2xl">
                              <span className="hidden md:flex">
                                {iconPicker(phase.careEnvironment)}
                              </span>
                              {phase.careEnvironmentLabel}
                            </div>
                            {/* only shown for md lg screens*/}

                            <div className="flex-1 text-end text-lg font-light md:col-span-3 md:justify-self-end md:text-2xl">
                              {formatCurrency(
                                phase.phaseInflatedProfessionalShareCost,
                              )}
                            </div>
                          </div>
                          <span className="ml-6 flex h-7 items-center">
                            {open ? (
                              <ChevronUpIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronDownIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </Disclosure.Button>
                      </dt>
                      <Disclosure.Panel
                        as="dd"
                        className="py-10 pr-12"
                      >
                        <div className="-translate-y-5 border-t border-gray-200"></div>
                        <div className="ml-4 flex w-full flex-col gap-2 md:flex-row">
                          <div className="flex basis-[20%] flex-col">
                            <div className="flex items-center gap-1 text-lg font-light md:text-xl">
                              {`${formatCurrency(phase.rateAmount)}/${phase.inHomeEnvironment ? 'hr' : 'mo'}`}
                              <Tooltip
                                title={
                                  <span style={{ fontSize: '16px' }}>
                                    Edit cost
                                  </span>
                                }
                              >
                                <IconButton
                                  aria-label="edit"
                                  onClick={() =>
                                    handleEditCostClick(phase.careEnvironment)
                                  }
                                >
                                  <CreateIcon
                                    sx={{
                                      fontSize: '16px',
                                      color: '#6b7280',
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </div>
                            <div className="text-base font-semibold">
                              {phase.hasCustomRate
                                ? `Custom rate`
                                : `${getRateLocaleDescription(clientLtcZipCode)}`}
                            </div>
                          </div>
                          {multSign}
                          <div className="basis-[20%]flex-grow flex flex-col">
                            <div className="text-lg font-light md:text-xl">
                              {phase.inHomeEnvironment
                                ? `${formatThousands(phase.phaseProfessionalCareHoursProvided)} hours`
                                : `${formatThousands(phase.phaseCareMonthsNeeded)} months`}
                            </div>
                            <div className="text-base font-semibold">
                              {phase.inHomeEnvironment
                                ? `Professional care hours`
                                : `${phase.isDurationCustom ? 'Custom duration' : 'Estimated duration'}`}
                            </div>
                          </div>
                          {multSign}
                          <div className="flex flex-grow basis-[20%] flex-col">
                            <div className="text-lg font-light md:text-xl">
                              {formatPercent(phase.phaseInflationFactor, 1)}
                            </div>
                            <div className="text-base font-semibold">
                              Cost growth over{' '}
                              {phase.yearsTillPhaseEnd
                                ? formatThousands(phase.yearsTillPhaseEnd)
                                : '0'}{' '}
                              years
                            </div>
                          </div>
                          {equalSign}
                          <div className="flex flex-grow basis-[20%] flex-row-reverse items-center justify-center gap-2 md:flex-col md:items-end md:gap-0">
                            <div className="text-lg font-light md:text-xl">
                              {formatCurrency(
                                phase.phaseInflatedProfessionalShareCost,
                              )}
                            </div>
                            <div className="text-lg font-semibold md:text-base">
                              Total
                            </div>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              );
            } else {
              return null;
            }
          })}
        </dl>
        <div className="mt-6 grid w-full grid-cols-8 gap-5 border-t-4 border-gray-900/10 pb-8 pt-6 md:pb-4">
          <div className="col-span-2 text-2xl font-semibold ">Total</div>
          <div className="col-span-3 col-start-6 mr-12 justify-self-end text-2xl font-light">
            {formatCurrency(allPhaseInflatedProfessionalShareCost)}
          </div>
        </div>

        {selectedCareEnvironment && (
          <CareEnvironmentCostModal
            selectedCareEnvironment={selectedCareEnvironment}
            open={openEditCostModal}
            setOpen={setOpenEditCostModal}
          />
        )}
      </SlideContent>
    </OnboardingChrome>
  );
}
