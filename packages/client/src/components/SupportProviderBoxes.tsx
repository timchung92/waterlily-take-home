import { useDispatch, useSelector } from 'react-redux';
import { selectClient, selectSupportProviderSet } from '../model/selectors';
import { useCallback } from 'react';
import {
  updateSupportProviderSet,
  CarePhase,
  SupportProviderType,
} from '@shared';
import {
  ThousandsIntegerInput,
  previewClientUpdates,
  putSupportProviderSetForClientByClientIdRequest,
} from '..';
import produce from 'immer';
import styles from './SupportProviderBoxes.module.css';
import { InputAdornment } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import DomainAddSharpIcon from '@mui/icons-material/DomainAddSharp';

interface SupportProviderBoxesProps {
  selectedCarePhase: CarePhase;
}

const iconMapping = {
  'Children': (
    <AccountCircle
      fontSize="small"
      sx={{ paddingBottom: '3px' }}
    />
  ),
  'Other Family': (
    <AccountCircle
      fontSize="small"
      sx={{ paddingBottom: '3px' }}
    />
  ),
  'Professional Care Service': (
    <DomainAddSharpIcon
      fontSize="small"
      sx={{ paddingBottom: '3px' }}
    />
  ),
};

function getIconByName(name: string) {
  const icon = iconMapping[name as keyof typeof iconMapping];
  return (
    icon ?? (
      <AccountCircle
        fontSize="small"
        sx={{ paddingBottom: '3px' }}
      />
    )
  );
}

export function SupportProviderBoxes({
  selectedCarePhase,
}: SupportProviderBoxesProps) {
  const supportProviders = useSelector(
    selectSupportProviderSet,
  ).supportProviders;

  return (
    <div className={styles.providersContainer}>
      {supportProviders.map(supportProvider => (
        <SupportProviderInput
          key={supportProvider.supportProviderId}
          supportProvider={supportProvider}
          selectedCarePhase={selectedCarePhase}
          startIcon={getIconByName(supportProvider.supportProviderName) ?? null}
        />
      ))}
    </div>
  );
}

function applyCarePhaseHours(
  supportProvider: SupportProvider,
  selectedCarePhase: CarePhase,
  value: number | null,
): SupportProvider {
  const updatedValue = value ?? 0;
  let savingSupportProvider = { ...supportProvider };
  switch (selectedCarePhase) {
    case CarePhase.earlyCare:
      savingSupportProvider.supportProviderPhaseOneHours = updatedValue;
      break;
    case CarePhase.moderateCare:
      savingSupportProvider.supportProviderPhaseTwoHours = updatedValue;
      break;
    // Add other cases as necessary
    case CarePhase.fullCare:
      savingSupportProvider.supportProviderPhaseThreeHours = updatedValue;
      break;
  }
  return savingSupportProvider;
}

function useChangeSupportProviderHoursCallback(
  supportProvider: SupportProvider,
  selectedCarePhase: CarePhase,
  isPreview: boolean,
) {
  const client = useSelector(selectClient);
  const { supportProviderSet } = client;
  const dispatch = useDispatch();

  return useCallback(
    (value: number | null) => {
      const savingSupportProvider = applyCarePhaseHours(
        supportProvider,
        selectedCarePhase,
        value,
      );
      const savingSupportProviderSet = updateSupportProviderSet(
        supportProviderSet,
        savingSupportProvider,
        false,
      );
      const action = isPreview
        ? previewClientUpdates(
            produce(client, client => {
              client.supportProviderSet = savingSupportProviderSet;
            }),
          )
        : putSupportProviderSetForClientByClientIdRequest({
            supportProviderSet: savingSupportProviderSet,
          });

      dispatch(action);
    },
    [client, dispatch, supportProvider, supportProviderSet, selectedCarePhase],
  );
}

function supportProviderAppliedPhaseHours(
  supportProvider: SupportProvider,
  selectedCarePhase: CarePhase,
): number {
  return selectedCarePhase === CarePhase.earlyCare
    ? supportProvider.supportProviderAppliedPhaseOneHours
    : selectedCarePhase === CarePhase.moderateCare
      ? supportProvider.supportProviderAppliedPhaseTwoHours
      : supportProvider.supportProviderAppliedPhaseThreeHours;
}

interface SupportProviderInputProps {
  supportProvider: SupportProvider;
  selectedCarePhase: CarePhase;
  startIcon: React.ReactNode;
}

export function SupportProviderInput({
  supportProvider,
  selectedCarePhase,
  startIcon,
}: SupportProviderInputProps) {
  const supportProviderAppliedHours = supportProviderAppliedPhaseHours(
    supportProvider,
    selectedCarePhase,
  );
  const isProfessionalSupportProvider =
    supportProvider.supportProviderType === SupportProviderType.professional;

  // Define the callback at the top level of your component
  const handleChange = useChangeSupportProviderHoursCallback(
    supportProvider,
    selectedCarePhase,
    false,
  );
  const handlePreview = useChangeSupportProviderHoursCallback(
    supportProvider,
    selectedCarePhase,
    true,
  );

  return (
    <ThousandsIntegerInput
      label={supportProvider.supportProviderName}
      unit="hrs"
      errorMessage="Whole numbers only"
      disabled={isProfessionalSupportProvider}
      value={supportProviderAppliedHours}
      onChange={handleChange}
      onPreview={handlePreview}
      startAdornment={
        <InputAdornment position="start">{startIcon}</InputAdornment>
      }
    />
  );
}
