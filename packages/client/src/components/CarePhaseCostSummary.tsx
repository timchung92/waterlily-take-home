import { IconButton, Tooltip } from '@mui/material';
import {
  capitalizeFirstLetter,
  careEnvironmentDefs,
  carePhaseDefs,
  formatCurrency,
  formatPercent,
  CareEnvironment,
  pickClientCareEnvironmentCosts,
  getRateLocaleDescription,
} from '@shared';
import CareEnvironmentCostModal from './CareEnvironmentCostModal';
import CreateIcon from '@mui/icons-material/Create';
import { useState } from 'react';

interface CarePhaseCostSummaryProps {
  client: Client;
  carePhase: CarePhase;
}

export function CarePhaseCostSummary({
  client,
  carePhase,
}: CarePhaseCostSummaryProps) {
  const {
    intakeSurvey: { clientLtcZipCode, clientCurrentCarePhase },
    phaseCosts,
    clientYearsTillPhaseEnd,
    clientPhaseInflationFactors,
  } = client;

  const [openEditCostModal, setOpenEditCostModal] = useState(false);
  const carePhaseIndex = carePhaseDefs[carePhase].index;
  const selectedCarePhaseCosts = phaseCosts[carePhaseIndex];

  // phase is in the past
  if (
    clientCurrentCarePhase &&
    carePhaseIndex < carePhaseDefs[clientCurrentCarePhase].index
  ) {
    return null;
  }

  const yearsTillPhaseEnd = clientYearsTillPhaseEnd[carePhase];
  const phaseInflationFactor = clientPhaseInflationFactors[carePhase];
  const selectedCareSetting = client.careEnvironmentSelections?.[carePhase];
  const isCareSettingHomeCare = selectedCareSetting === CareEnvironment.home;
  const clientCareEnvironmentCostData = selectedCareSetting
    ? pickClientCareEnvironmentCosts(client, selectedCareSetting)
    : undefined;

  const isDurationCustom = selectedCarePhaseCosts.isDurationCustom;
  const rateLocalDescription = getRateLocaleDescription(clientLtcZipCode);

  return (
    <div className="h-4/5 rounded-lg bg-gray-50 px-4 py-6 lg:flex-grow lg:px-6">
      <h2
        id="summary-heading"
        className="text-lg font-medium text-darkPurple"
      >
        Cost Summary ({carePhaseDefs[carePhase].label})
      </h2>

      <dl className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-base text-gray-600">
            {selectedCareSetting
              ? isCareSettingHomeCare
                ? 'Home care'
                : capitalizeFirstLetter(
                    careEnvironmentDefs[selectedCareSetting].label,
                  )
              : 'Care setting'}{' '}
            cost
            <div className="text-sm text-gray-500">
              {clientCareEnvironmentCostData?.hasCustomRate
                ? 'Edited rate'
                : rateLocalDescription}
            </div>
          </dt>
          <dd
            className={`${selectedCareSetting ? '' : 'hidden'} flex items-center text-base font-medium text-darkPurple`}
          >
            <Tooltip
              title={<span style={{ fontSize: '16px' }}>Edit cost</span>}
            >
              <IconButton
                aria-label="edit"
                onClick={() => setOpenEditCostModal(true)}
              >
                <CreateIcon
                  sx={{
                    fontSize: '16px',
                    color: '#6b7280',
                  }}
                />
              </IconButton>
            </Tooltip>
            {formatCurrency(clientCareEnvironmentCostData?.rateAmount) +
              '/' +
              (isCareSettingHomeCare ? 'hr' : 'mo')}
          </dd>
          <dd
            className={`${selectedCareSetting ? 'hidden' : ''} flex items-center text-base font-medium text-darkPurple`}
          >
            $ --
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="flex items-center text-base text-gray-600">
            <span>
              {isCareSettingHomeCare
                ? 'Professional care hours'
                : isDurationCustom
                  ? 'Custom duration'
                  : 'Estimated duration'}
            </span>
          </dt>
          <dd className="text-base font-medium text-darkPurple">
            {isCareSettingHomeCare
              ? Math.round(
                  selectedCarePhaseCosts.phaseProfessionalCareHoursProvided,
                ) + ' hrs'
              : Math.round(selectedCarePhaseCosts.phaseCareMonthsNeeded) +
                ' months'}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="text-base text-gray-600">
            Growth in cost
            <div className="text-sm text-gray-500">
              Over{' '}
              {yearsTillPhaseEnd! < 1
                ? `${Math.round(selectedCarePhaseCosts.phaseCareMonthsNeeded)} months`
                : `${yearsTillPhaseEnd!.toFixed(1)} year${yearsTillPhaseEnd === 1 ? '' : 's'}`}
            </div>
          </dt>

          <dd className="text-base font-medium text-darkPurple">
            {formatPercent(phaseInflationFactor, 1)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="text-base font-medium text-darkPurple">Total</dt>
          <dd className="text-medium font-medium text-darkPurple">
            {selectedCareSetting
              ? formatCurrency(
                  selectedCarePhaseCosts.phaseInflatedProfessionalShareCost,
                )
              : '$ --'}
          </dd>
        </div>
      </dl>
      {selectedCareSetting && (
        <CareEnvironmentCostModal
          selectedCareEnvironment={selectedCareSetting}
          open={openEditCostModal}
          setOpen={setOpenEditCostModal}
        />
      )}
    </div>
  );
}
