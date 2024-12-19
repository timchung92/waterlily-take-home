import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmailPreferencesForPublicByEmailRequest,
  putEmailPreferencesForPublicRequest,
  selectEmailPreferences,
} from '../model';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function EmailToggle({
  label,
  description,
  enabled,
  setEnabled,
  isLoading,
  disabled,
}: {
  label: string;
  description: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  return (
    <Switch.Group
      as="div"
      className="flex items-center justify-between space-x-4"
    >
      <span className="flex flex-grow flex-col">
        <Switch.Label
          as="span"
          className="text-sm font-medium leading-6 text-gray-900"
          passive
        >
          {label}
        </Switch.Label>
        <Switch.Description
          as="span"
          className="text-sm text-gray-500"
        >
          {description}
        </Switch.Description>
      </span>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"></div>
        </div>
      ) : (
        <Switch
          checked={enabled}
          onChange={setEnabled}
          disabled={disabled}
          className={classNames(
            enabled ? 'bg-purple' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:pointer-events-none',
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              enabled ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            )}
          />
        </Switch>
      )}
    </Switch.Group>
  );
}

export function EmailPreferences() {
  const [searchParams] = useSearchParams();
  const email = atob(searchParams.get('t') || '');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const dispatch = useDispatch();

  const [emailPreferencesState, setEmailPreferencesState] = useState({
    optOutReminders: false,
    optOutTransactions: false,
  });

  const savedEmailPreferences = useSelector(selectEmailPreferences);

  useEffect(() => {
    dispatch(fetchEmailPreferencesForPublicByEmailRequest(email));
  }, [email, dispatch]);

  useEffect(() => {
    setEmailPreferencesState({
      optOutReminders: savedEmailPreferences.optOutReminders,
      optOutTransactions: savedEmailPreferences.optOutTransactions,
    });
  }, [savedEmailPreferences]);

  const createHandleEmailToggleChange =
    (key: 'optOutReminders' | 'optOutTransactions') => (enabled: boolean) => {
      setEmailPreferencesState(state => ({
        ...state,
        [key]: !enabled,
      }));
    };
  const handleSubmit = () => {
    dispatch(
      putEmailPreferencesForPublicRequest({
        email,
        optOutReminders: emailPreferencesState.optOutReminders,
        optOutTransactions: emailPreferencesState.optOutTransactions,
      }),
    );
    setHasSubmitted(true);
  };

  let body;

  const isUnsubscribedFromAllEmails = Object.keys(emailPreferencesState).every(
    key => emailPreferencesState[key as keyof typeof emailPreferencesState],
  );

  if (!email) {
    body = (
      <h3 className="text-base font-semibold leading-6 text-red-500">
        No email found
      </h3>
    );
  } else if (savedEmailPreferences.error) {
    body = (
      <h3 className="text-base font-semibold leading-6 text-red-500">
        {savedEmailPreferences.error}
      </h3>
    );
  } else {
    body = (
      <div className="flex flex-col space-y-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          {`Manage email preferences for ${email}`}
        </h3>
        <EmailToggle
          label="Reminders"
          description="Get emails that remind you to take action on important steps in your journey"
          enabled={!emailPreferencesState.optOutReminders}
          setEnabled={createHandleEmailToggleChange('optOutReminders')}
          disabled={hasSubmitted}
          isLoading={savedEmailPreferences.isLoading}
        />
        <EmailToggle
          label="Transactions"
          description="Get emails about transactions and account activity"
          enabled={!emailPreferencesState.optOutTransactions}
          setEnabled={createHandleEmailToggleChange('optOutTransactions')}
          disabled={hasSubmitted}
          isLoading={savedEmailPreferences.isLoading}
        />
        {/** unsubscribe from all emails checkbox*/}
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="unsub-all"
              aria-describedby="unsub-all-description"
              name="unsub-all"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              checked={isUnsubscribedFromAllEmails}
              disabled={hasSubmitted}
              onChange={e => {
                const checked = e.target.checked;
                if (checked)
                  setEmailPreferencesState({
                    optOutReminders: true,
                    optOutTransactions: true,
                  });
                else {
                  setEmailPreferencesState({
                    optOutReminders: false,
                    optOutTransactions: false,
                  });
                }
              }}
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="unsub-all"
              className="font-medium text-gray-900"
            >
              Unsubscribe from all emails
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          {hasSubmitted ? (
            <p className="text-sm text-green-500">
              &#x2714; Your preferences have been updated.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex w-full justify-center rounded-md bg-darkPurple px-8 py-2 text-lg font-semibold text-white shadow-sm hover:bg-darkPurple/90 sm:ml-3 sm:w-auto"
            >
              Update Preferences
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1 py-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight pl-4 md:pl-0">
          Waterlily Email Preferences
        </h2>
      </div>
      <div className="bg-gray-50 sm:rounded-lg sm:p-6 lg:p-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="flex flex-col px-4 py-5 sm:p-6">{body}</div>
        </div>
      </div>
    </div>
  );
}
