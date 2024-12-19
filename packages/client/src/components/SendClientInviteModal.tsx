import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  cn,
  Modal,
  ModalDoneButton,
  postAdvisorNewClientRequest,
  postIntakeFormEmailRequest,
  resetIntakeFormEmail,
  selectIntakeFormEmail,
} from '@client';
import { getIntroIntakeFormApiEndPoint, newUuid } from '@shared';

import { TextareaAutosize } from '@mui/material';
import { isValidEmailFormat } from '../util/isValidEmailFormat';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import RadioSelect from './RadioSelectOptions';
import { shouldSendClientEmailRadioOptions } from './AdvisorDashboardSettings';
import { Send, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getClientIntakeFormEmailTemplate } from '@shared/email/templates/clientIntakeFormEmailTemplate';

interface SendClientIntakeFormProps {
  open: boolean;
  onClose: () => void;
  advisor: Advisor;
  organizationName: string | undefined;
  className?: string;
}

export function SendClientIntakeModal({
  open,
  onClose,
  advisor,
  organizationName,
  className,
}: SendClientIntakeFormProps) {
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const { advisorId, sendClientResultsLinkSetting } = advisor;
  const [advisorProvidedBody, setAdvisorProvidedBody] = useState<
    string | undefined
  >(undefined);
  const [isClientEmailValid, setIsClientEmailValid] = useState(
    isValidEmailFormat(clientEmail),
  );
  const { status } = useSelector(selectIntakeFormEmail);
  const dispatch = useDispatch();
  const surveyId = newUuid();
  const [sendClientResultsLink, setSendClientResultsLink] = useState<boolean>(
    sendClientResultsLinkSetting ?? false,
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showTestEmailAlert, setShowTestEmailAlert] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(resetIntakeFormEmail());
      setClientEmail('');
      setClientFirstName('');
      setClientLastName('');
      setAdvisorProvidedBody(undefined);
      setIsClientEmailValid(false);
      setSendClientResultsLink(advisor.sendClientResultsLinkSetting ?? false);
      setShowPreview(false);
      setShowTestEmailAlert(false);
    }
  }, [open, dispatch, advisor.sendClientResultsLinkSetting]);

  const onSendEmailClick = () => {
    dispatch(
      postIntakeFormEmailRequest({
        email: clientEmail,
        clientFirstName,
        advisorProvidedBody,
        advisorFirstName: advisor.advisorFirstName,
        intakeFormLink: intakeFormUrl,
        advisorOrganization: organizationName,
      }),
    );
    dispatch(
      postAdvisorNewClientRequest({
        advisorId,
        clientEmail,
        clientFirstName,
        clientLastName,
        surveyId,
        intakeFormUrl,
      }),
    );
  };

  const onClientEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = e.target.validity.valid && e.target.value.length > 0;
    setIsClientEmailValid(isValidEmailFormat(e.target.value) && isValid);
    setClientEmail(e.target.value);
  };

  const handleClientResultsChange = (value: string | number) => {
    setSendClientResultsLink(String(value) === 'yes');
  };

  const intakeFormUrl = `${getIntroIntakeFormApiEndPoint(
    advisorId,
    sendClientResultsLink,
    surveyId,
  )}`;

  const requiredFields = (
    <div className="flex flex-col gap-0.5 pt-2 ">
      <FieldLabel
        text="Recipient email"
        className="font-semibold"
      />
      <TextInput
        type="email"
        id="clientEmail"
        name="email-address"
        autoComplete="email"
        disabled={status === 'loading'}
        placeholder="Enter email address"
        value={clientEmail}
        onChange={onClientEmailChange}
      />
    </div>
  );

  const optionalFields = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col space-y-3">
        <div className="mb-2 flex flex-col gap-5 space-y-3 md:flex-row md:gap-2 md:space-y-0">
          <div className="flex h-10 w-full flex-col gap-0.5 ">
            <FieldLabel text="First name" />
            <TextInput
              type="text"
              id="firstname"
              placeholder="Enter first name"
              name="first-name"
              disabled={status === 'loading'}
              value={clientFirstName}
              autoComplete="given-name"
              onChange={e => setClientFirstName(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex h-10 w-full flex-col gap-0.5">
            <FieldLabel text="Last name" />
            <TextInput
              type="text"
              id="lastname"
              placeholder="Enter last name"
              name="last-name"
              value={clientLastName}
              disabled={status === 'loading'}
              autoComplete="family-name"
              onChange={e => setClientLastName(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-0.5">
        <FieldLabel text="Personalized message" />
        <TextareaAutosize
          id="optionalAdvisorEmailBody"
          name="advisor-message"
          minRows={4}
          value={advisorProvidedBody}
          disabled={status === 'loading'}
          onChange={e => setAdvisorProvidedBody(e.target.value)}
          className="block w-full rounded-md border-0 bg-white px-2 py-1.5 text-sm leading-6  text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600"
          placeholder={'Add a personalized message'}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="mb-1 ml-1 text-sm text-gray-900">
          Client Results Sharing
        </label>
        <RadioSelect
          name="client-results"
          options={shouldSendClientEmailRadioOptions}
          selectedValue={sendClientResultsLink ? 'yes' : 'no'}
          onChange={handleClientResultsChange}
          className="tracking-normal"
        />
      </div>
    </div>
  );

  const handleSendTestEmail = async () => {
    dispatch(
      postIntakeFormEmailRequest({
        email: advisor.advisorEmail,
        clientFirstName: clientFirstName ?? 'Test',
        advisorProvidedBody,
        advisorFirstName: advisor.advisorFirstName,
        intakeFormLink: intakeFormUrl,
        advisorOrganization: organizationName,
        isTestEmail: true,
      }),
    );
  };

  useEffect(() => {
    if (status === 'complete test email') {
      setShowTestEmailAlert(true);
      setTimeout(() => {
        setShowTestEmailAlert(false);
        dispatch(resetIntakeFormEmail());
      }, 3000);
    }
  }, [status]);

  const PreviewEmail = () => {
    const { advisorFirstName, organizationDisplayName } = advisor;
    const intakeFormLink = `${getIntroIntakeFormApiEndPoint(
      advisorId,
      sendClientResultsLink,
      surveyId,
    )}`;
    const emailHtml = getClientIntakeFormEmailTemplate({
      clientFirstName,
      advisorFirstName,
      intakeFormLink,
      advisorOrganization: organizationDisplayName ?? '',
      advisorProvidedBody,
    });

    return (
      <div className="mt-4 space-y-4 rounded-lg border bg-gray-50 p-4">
        <div className="text-sm text-gray-500">
          Preview of invitation email:
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: emailHtml }}
          className="max-h-[500px] overflow-auto text-gray-900"
        />
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite client"
      subTitle="Email your client the intake form and track their status on the
          dashboard."
      width="md"
      isLoading={status === 'loading' || status === 'sending test email'}
      errorMessage={
        status === 'error'
          ? 'Email failed to send. Please try again or contact support.'
          : ''
      }
      showSuccess={status === 'complete'}
      successMessage="Email invitation sent!"
      primaryButton={
        <ModalDoneButton
          buttonText={
            <span className="flex  items-center gap-2">
              <Send />
              Send invitation
            </span>
          }
          onClick={onSendEmailClick}
          disabled={!isClientEmailValid}
        />
      }
    >
      <div
        className={cn(
          'my-6 flex flex-col justify-between pr-4 text-left',
          className,
        )}
      >
        {requiredFields}
        <Accordion
          type="single"
          collapsible
          className="flex justify-end"
        >
          <AccordionItem
            value="optional-fields"
            className="border-none text-sm"
          >
            <AccordionTrigger
              className="flex justify-end gap-2 text-sm text-gray-700"
              withBackground={false}
            >
              Optional fields
            </AccordionTrigger>
            <AccordionContent className="rounded-md bg-gray-100 p-4">
              {optionalFields}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-4 flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="text-gray-700"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendTestEmail}
            disabled={status === 'loading' || status === 'sending test email'}
            className=" text-gray-700"
          >
            <Mail className="h-4 w-4" />
            Send Test Email
          </Button>
        </div>

        {showPreview && <PreviewEmail />}

        {showTestEmailAlert && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <AlertDescription>
              Test email sent to {advisor.advisorEmail}. Please check your
              inbox.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Modal>
  );
}

function FieldLabel({ text, className }: TextProps) {
  return (
    <label className={cn('mb-1 ml-1 text-sm text-gray-900', className)}>
      {text}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'rounded-md border border-gray-100 bg-gray-100 px-2 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
        props.className,
      )}
    />
  );
}

interface TextProps {
  text: string;
  className?: string;
}
