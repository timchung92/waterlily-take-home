import {
  Modal,
  postBatchIntakeFormEmailRequest,
  postAdvisorNewClientRequest,
  resetIntakeFormEmail,
  selectIntakeFormEmail,
} from '@client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { EmailTagInput } from './EmailTagInput';
import { Tag } from './TagInputs';
import { Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getIntroIntakeFormApiEndPoint, newUuid } from '@shared';
import RadioSelect from './RadioSelectOptions';
import { shouldSendClientEmailRadioOptions } from './AdvisorDashboardSettings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface BatchInviteModalProps {
  open: boolean;
  onClose: () => void;
  advisor: Advisor;
}

interface EmailData {
  email: string;
  intakeFormLink: string;
  surveyId: string;
  advisorId: string;
}

interface AdditionalSettingsProps {
  sendClientResultsLink: boolean;
  onClientResultsChange: (value: string | number) => void;
}

function AdditionalSettings({
  sendClientResultsLink,
  onClientResultsChange,
}: AdditionalSettingsProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="flex justify-end"
    >
      <AccordionItem
        value="settings"
        className="w-full border-none text-sm"
      >
        <AccordionTrigger
          className="flex justify-end gap-2 text-sm text-gray-700"
          withBackground={false}
        >
          Additional Settings
        </AccordionTrigger>
        <AccordionContent className="p-2">
          <div className="flex flex-col gap-0.5">
            <label className="mb-1 ml-1 text-sm text-gray-900">
              Client Results Sharing
            </label>
            <RadioSelect
              name="client-results"
              options={shouldSendClientEmailRadioOptions}
              selectedValue={sendClientResultsLink ? 'yes' : 'no'}
              onChange={onClientResultsChange}
              className="tracking-normal"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface EmailProcessingHook {
  processEmails: (
    emails: Tag[],
    advisor: Advisor,
    sendClientResultsLink: boolean,
  ) => EmailData[];
  handleSuccessfulEmails: (
    emailData: EmailData[],
    failedEmails: string[],
  ) => void;
}

export function useEmailProcessing(): EmailProcessingHook {
  const dispatch = useDispatch();

  const processEmails = (
    emails: Tag[],
    advisor: Advisor,
    sendClientResultsLink: boolean,
  ) => {
    return emails
      .filter(email => !email.error)
      .map(email => {
        const surveyId = newUuid();
        return {
          email: email.value,
          surveyId,
          advisorId: advisor.advisorId,
          advisorFirstName: advisor.advisorFirstName,
          advisorOrganization: advisor.organizationDisplayName,
          intakeFormLink: getIntroIntakeFormApiEndPoint(
            advisor.advisorId,
            sendClientResultsLink,
            surveyId,
          ),
        };
      });
  };

  const handleSuccessfulEmails = (
    emailData: EmailData[],
    failedEmails: string[],
  ) => {
    const successfulEmails = emailData.filter(
      data => !failedEmails.includes(data.email),
    );

    successfulEmails.forEach(data => {
      dispatch(
        postAdvisorNewClientRequest({
          advisorId: data.advisorId,
          clientEmail: data.email,
          clientFirstName: '',
          clientLastName: '',
          surveyId: data.surveyId,
          intakeFormUrl: data.intakeFormLink,
        }),
      );
    });
  };

  return { processEmails, handleSuccessfulEmails };
}

export function BatchInviteModal({
  open,
  onClose,
  advisor,
}: BatchInviteModalProps) {
  const [emails, setEmails] = useState<Tag[]>([]);
  const { status, errorMessage, failedEmails } = useSelector(
    selectIntakeFormEmail,
  );
  const dispatch = useDispatch();
  const [sendClientResultsLink, setSendClientResultsLink] = useState<boolean>(
    advisor.sendClientResultsLinkSetting ?? false,
  );

  const { processEmails, handleSuccessfulEmails } = useEmailProcessing();
  const emailDataRef = useRef<EmailData[]>([]);

  // Reset the state when the modal opens
  useEffect(() => {
    if (open) {
      setEmails([]);
      dispatch(resetIntakeFormEmail());
      setSendClientResultsLink(advisor.sendClientResultsLinkSetting ?? false);
      emailDataRef.current = [];
    }
  }, [open, advisor.sendClientResultsLinkSetting]);

  const handleEmailsChange = (newEmails: Tag[]) => {
    setEmails(newEmails);
  };

  // Create clients when the status is complete
  useEffect(() => {
    if (status === 'complete' || status === 'complete with errors') {
      handleSuccessfulEmails(emailDataRef.current, failedEmails);

      if (status === 'complete with errors') {
        setEmails(emails.filter(email => failedEmails.includes(email.value)));
        emailDataRef.current = emailDataRef.current.filter(data =>
          failedEmails.includes(data.email),
        );
      }
    }
  }, [status, failedEmails]);

  const handleClientResultsChange = (value: string | number) => {
    setSendClientResultsLink(String(value) === 'yes');
  };

  const handleSubmit = () => {
    emailDataRef.current = processEmails(
      emails,
      advisor,
      sendClientResultsLink,
    );
    dispatch(
      postBatchIntakeFormEmailRequest({
        intakeFormEmailProps: emailDataRef.current,
      }),
    );
  };

  const validEmails = emails.filter(email => !email.error);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk Invite"
      subTitle="Invite multiple clients at once"
      showSuccess={status === 'complete'}
      isLoading={status === 'loading'}
      errorMessage={
        status === 'complete with errors'
          ? errorMessage || 'Some invites failed to send'
          : status === 'error'
            ? errorMessage || 'Error sending invites'
            : ''
      }
      successMessage="Invites sent successfully"
      primaryButton={
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="text-gray-600"
            onClick={() => {
              handleEmailsChange([]);
            }}
          >
            Clear
          </Button>
          <Button
            disabled={validEmails.length === 0 || status === 'loading'}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
            {status === 'loading'
              ? 'Sending...'
              : `Send ${validEmails.length} Invites`}
          </Button>
        </div>
      }
    >
      <div className="my-4 space-y-3">
        <EmailTagInput
          onChange={handleEmailsChange}
          initialEmails={emails}
          maxEmails={25}
        />
        <AdditionalSettings
          sendClientResultsLink={sendClientResultsLink}
          onClientResultsChange={handleClientResultsChange}
        />
      </div>
    </Modal>
  );
}
