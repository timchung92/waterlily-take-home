import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  fetchClientByClientIdRequest,
  selectClientDataExists,
  selectClientIsLoading,
  selectMaybeClient,
} from '..';
import { useEffect } from 'react';
import { fullName } from '@shared';

import clientIntakeFormSchema from '../util/clientIntakeFormSchema.json';
import { isArray } from 'lodash';

export function ClientDataModal({
  partialClient,
  open,
  onClose,
}: {
  partialClient: Client;
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const clientIsLoading = useSelector(selectClientIsLoading);
  const clientDataExists = useSelector(selectClientDataExists);
  const clientDataReady = clientDataExists && !clientIsLoading;

  // Separate the fetch logic into its own effect
  useEffect(() => {
    // Only fetch if we don't have the data yet
    if (open) {
      dispatch(fetchClientByClientIdRequest(partialClient.clientId));
    }
  }, [open, partialClient.clientId, dispatch]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${fullName(partialClient) ?? 'Client Information'}`}
      subTitle={`Information provided in ${fullName(partialClient) ? `${fullName(partialClient)}'s ` : 'the '} intake form.`}
      width="lg"
    >
      <ClientDataDescriptionList isLoading={!clientDataReady} />
    </Modal>
  );
}

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
    <dt className="text-sm font-medium leading-6 text-gray-900">{label}</dt>
    <dd className="mt-1 text-sm leading-6 text-gray-600 sm:col-span-2 sm:mt-0">
      {value}
    </dd>
  </div>
);

function ClientDataDescriptionList({ isLoading }: { isLoading: boolean }) {
  const client = useSelector(selectMaybeClient);

  if (isLoading || !client) {
    return (
      <div className="my-10 flex h-64 items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  const { intakeSurvey, introIntakeSurvey } = client;

  const formatValue = (value: any, type: string) => {
    switch (type) {
      case 'string':
        return value || 'N/A';
      case 'integer':
        return value ? value.toString() : 'N/A';
      case 'number':
        return value ? `$${parseFloat(value).toLocaleString()}` : 'N/A';
      case 'percent':
        return value ? `${parseFloat(value)}%` : 'N/A';
      case 'list':
        // check if value is an array
        const arr = isArray(value) ? value : [value];
        if (!value || arr.length < 1) return 'None';
        return (
          <ul className="list-inside list-disc">
            {arr.map((item: any, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
      case 'date':
        return value ? new Date(value).toLocaleDateString() : 'N/A';
      default:
        return 'N/A';
    }
  };

  const renderSurveyDetails = <T extends Record<string, any>>(
    surveyData: T,
  ) => {
    const sortedDetails = Object.entries(clientIntakeFormSchema)
      .filter(([key]) => key in surveyData) // Ensures we only include fields present in surveyData
      .sort((a, b) => a[1].group.localeCompare(b[1].group));

    return sortedDetails.map(([key, { label, type }]) => (
      <DetailRow
        key={key}
        label={label}
        value={formatValue(surveyData[key as keyof T], type)}
      />
    ));
  };

  return (
    <div
      data-hj-suppress
      className="mt-6 "
    >
      {introIntakeSurvey && (
        <>
          <h2 className="text-base font-semibold text-gray-600">
            Client Information
          </h2>
          <dl className="divide-y divide-gray-100">
            {renderSurveyDetails<IntroIntakeSurvey>(introIntakeSurvey)}
          </dl>
        </>
      )}
      <h2 className="mt-6 text-base font-semibold text-gray-600">
        Intake Survey Answers
      </h2>
      <dl className="divide-y divide-gray-100">
        {renderSurveyDetails<IntakeSurvey>(intakeSurvey)}
      </dl>
    </div>
  );
}

const LoadingSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      className="w-full animate-pulse space-y-4 divide-y divide-gray-200 rounded  p-4  md:p-6 "
    >
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between pt-4 first:pt-0"
        >
          <div>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 "></div>
            <div className="h-2 w-32 rounded-full bg-gray-200 "></div>
          </div>
          <div className="h-2.5 w-12 rounded-full bg-gray-300 "></div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
