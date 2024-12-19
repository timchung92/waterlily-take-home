import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AuthInputDisabledField,
  AuthInputTextField,
  FormErrorAlert,
  TextButton,
  postAdvisorUpdatesByAdvisorIdRequest,
  resetAdvisorSettings,
  selectAdvisorState,
  selectSessionAdvisor,
} from '..';
import _ from 'lodash';
import { SubmitButton } from './FormComponents';
import { Toast } from './Toast';
import { addHttpsIfNoScheme, isValidUrl, isNullOrUndefined } from '@shared';
import RadioSelect from './RadioSelectOptions';

type AdvisorDashboardSettingsProps = {
  show: boolean;
  advisorSideBarMobileButton: React.ReactNode;
  advisorSideBarMobile: React.ReactNode;
  backToClientsButton: React.ReactNode;
};

export function AdvisorDashboardSettings({
  show,
  advisorSideBarMobileButton,
  advisorSideBarMobile,
  backToClientsButton,
}: AdvisorDashboardSettingsProps) {
  const advisor = useSelector(selectSessionAdvisor);
  const dispatch = useDispatch();
  const {
    advisorSettings,
    advisorSettings: { isLoading, status },
  } = useSelector(selectAdvisorState);
  const [advisorState, setAdvisorState] = useState<AdvisorProfile>(advisor);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdvisorProfile, boolean>>
  >({});
  const [hasStateChanged, setHasStateChanged] = useState(false);
  const [showSucessToast, setShowSuccessToast] = useState(false);

  const resetState = () => {
    setAdvisorState(advisor);
    setErrors({});
    setShowSuccessToast(false);
    setHasStateChanged(false);
  };

  useEffect(() => {
    if (isLoading) {
      setShowSuccessToast(false);
    }
    if (status === 'complete' && isLoading === false) {
      dispatch(resetAdvisorSettings());
      setShowSuccessToast(true);
    }
  }, [advisorSettings]);

  useEffect(() => {
    resetState();
  }, [show]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const maxSchedulingLinkDisplayTextLength = 38;

  const handleAdvisorStateChange =
    (advisorKey: keyof AdvisorProfile) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAdvisorState(prevState => ({
        ...prevState,
        [advisorKey]: event.target.value,
      }));
      setHasStateChanged(true);
    };

  const validateForm = (advisorProfile: AdvisorProfile) => {
    const { schedulingLinkUrl, schedulingLinkDisplayText } = advisorProfile;

    // Reset errors
    setErrors({});
    setErrorMessage(null);

    // Validate schedulingLinkDisplayText length
    if (
      schedulingLinkDisplayText &&
      schedulingLinkDisplayText.length > maxSchedulingLinkDisplayTextLength
    ) {
      setErrors(prevState => ({
        ...prevState,
        schedulingLinkDisplayText: true,
      }));
      setErrorMessage(
        `Scheduling link text must not exceed ${maxSchedulingLinkDisplayTextLength} characters`,
      );
      return;
    }

    // Existing URL validation
    if (schedulingLinkUrl) {
      let formattedUrl = schedulingLinkUrl.trim();
      formattedUrl = addHttpsIfNoScheme(formattedUrl);

      if (!isValidUrl(formattedUrl)) {
        setErrors(prevState => ({
          ...prevState,
          schedulingLinkUrl: true,
        }));
        setErrorMessage('Please enter a valid URL');
        return;
      }
      advisorProfile.schedulingLinkUrl = formattedUrl;
      setAdvisorState(advisorProfile);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasStateChanged) {
      return;
    }

    const advisorProfile = _.omit(advisorState, [
      'advisorCognitoRef',
      'advisorCreatedDateTime',
    ]) as AdvisorProfile;

    validateForm(advisorProfile);

    if (Object.values(errors).some(error => error)) {
      return;
    }

    try {
      dispatch(postAdvisorUpdatesByAdvisorIdRequest(advisorProfile));
      setHasStateChanged(false);
    } catch (error) {
      setErrorMessage('Failed to update advisor profile. Please try again.');
    }
  };

  const handleShouldSendClientEmailChange = (value: string | number) => {
    setAdvisorState(prevState => ({
      ...prevState,
      sendClientResultsLinkSetting: value === 'yes',
    }));
    setHasStateChanged(true);
  };

  if (!show) {
    return null;
  }

  return (
    <>
      {advisorSideBarMobile}
      <div className="fixed h-screen w-screen grow divide-y divide-white/5 overflow-scroll pb-12 lg:bg-slate-50 lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-28 shrink-0 items-center gap-x-4 bg-white px-4 pb-1 sm:gap-x-6 sm:px-6 lg:hidden ">
          {advisorSideBarMobileButton}
        </div>

        <div className="sticky top-0 z-40 mt-10 hidden shrink-0 bg-slate-50 px-10 lg:flex">
          {backToClientsButton}
        </div>

        {/* Settings */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-14 mt-4 max-w-2xl bg-white px-12 sm:rounded-xl lg:my-2 lg:py-12 lg:shadow-sm lg:ring-1 lg:ring-gray-900/5"
        >
          <div className="md:pb-12">
            <h2 className="text-lg font-semibold leading-7 text-gray-900">
              Advisor Profile
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <AuthInputDisabledField
                id="first-name"
                label="First name"
                value={advisorState.advisorFirstName}
                autoComplete="given-name"
                className="mt-0 sm:col-span-3"
              />

              <AuthInputDisabledField
                id="last-name"
                label="Last name"
                value={advisorState.advisorLastName}
                autoComplete="family-name"
                className="mt-0 sm:col-span-3"
              />
              <AuthInputDisabledField
                id="email"
                label="Email address"
                value={advisorState.advisorEmail}
                autoComplete="email"
                className="mt-0 sm:col-span-4"
              />

              <AuthInputTextField
                id="organizationName"
                label="Organization Name (Legal)"
                value={advisorState.organizationName ?? ''}
                onChange={handleAdvisorStateChange('organizationName')}
                error={errors.organizationName}
                className="mt-0 sm:col-span-4"
              />

              <AuthInputTextField
                id="organizationDisplayName"
                label="Organization Name (Whitelabel)"
                value={advisorState.organizationDisplayName ?? ''}
                onChange={handleAdvisorStateChange('organizationDisplayName')}
                error={errors.organizationDisplayName}
                className="mt-0 sm:col-span-4"
              />

              <AuthInputTextField
                id="schedulingLinkUrl"
                label="Scheduling Link (allow clients to book time on your calendar)"
                value={advisorState.schedulingLinkUrl ?? ''}
                onChange={handleAdvisorStateChange('schedulingLinkUrl')}
                required={false}
                error={errors.schedulingLinkUrl}
                className="mt-0 sm:col-span-4"
              />
              {!errors.schedulingLinkUrl && (
                <TextButton
                  buttonLabel="Open link to test"
                  href={advisorState.schedulingLinkUrl}
                  className="-mt-5 ml-1 text-sm sm:col-span-4"
                />
              )}
              <AuthInputTextField
                id="schedulingLinkDisplayText"
                label={`Scheduling Link Button Text (max ${maxSchedulingLinkDisplayTextLength} characters)`}
                value={advisorState.schedulingLinkDisplayText ?? ''}
                onChange={handleAdvisorStateChange('schedulingLinkDisplayText')}
                required={false}
                error={errors.schedulingLinkDisplayText}
                className="mt-0 sm:col-span-4"
                placeholder="Connect with an advisor"
              />

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Client Results Sharing
                </label>
                <div className="mt-2">
                  <RadioSelect
                    name="client-results"
                    options={shouldSendClientEmailRadioOptions}
                    selectedValue={
                      advisorState.sendClientResultsLinkSetting ? 'yes' : 'no'
                    }
                    onChange={handleShouldSendClientEmailChange}
                    className="tracking-normal"
                  />
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <FormErrorAlert
              mainErrorMessage={errorMessage}
              className="my-4 md:my-0"
            />
          )}
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className={
                'text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700'
              }
              onClick={resetState}
            >
              Cancel
            </button>
            <SubmitButton
              label="Save"
              isLoading={isLoading}
              disabled={isLoading || !hasStateChanged}
            />
          </div>
        </form>
      </div>
      <Toast
        show={showSucessToast}
        onClose={() => setShowSuccessToast(false)}
        title="Successfully saved!"
      />
    </>
  );
}

export const shouldSendClientEmailRadioOptions = [
  {
    label: 'Enable Client Self-Service:',
    description: 'Give client(s) direct access to view their results.',
    value: 'yes',
    id: 'yes-client-results',
  },
  {
    label: 'Manual Sharing:',
    description: `I'll handle sharing results with my client(s).`,
    value: 'no',
    id: 'no-client-results',
  },
];
