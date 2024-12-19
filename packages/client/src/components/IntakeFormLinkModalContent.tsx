import { Tooltip } from '@mui/material';
import { getIntroIntakeFormApiEndPoint } from '@shared';
import { useCallback, useState } from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { MdOutlineContentCopy } from 'react-icons/md';
import { BsCheckLg } from 'react-icons/bs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import RadioSelect from './RadioSelectOptions';
import { shouldSendClientEmailRadioOptions } from './AdvisorDashboardSettings';
import { Button } from './ui/button';

type IntakeFormLinkProps = {
  advisor: Advisor;
  className?: string;
};

export function IntakeFormLinkModalContent({
  advisor,
  className,
}: IntakeFormLinkProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [tooltipText, setTooltipText] = useState('Copy');
  const { advisorId, sendClientResultsLinkSetting } = advisor;
  const [sendClientResultsLink, setSendClientResultsLink] = useState<boolean>(
    sendClientResultsLinkSetting ?? false,
  );

  const intakeFormUrl = `${getIntroIntakeFormApiEndPoint(
    advisorId,
    sendClientResultsLink,
  )}`;

  function handleOpenIntakeForm() {
    window.open(intakeFormUrl, '_blank');
  }

  const copyLinkToClipboard = useCallback(() => {
    navigator.clipboard.writeText(intakeFormUrl);
    setShowCheckmark(true);
    setTooltipText('Copied!');
    setTimeout(() => {
      setShowCheckmark(false);
      setTooltipText('Copy');
    }, 4000);
  }, [intakeFormUrl]);

  const handleClientResultsChange = (value: string | number) => {
    setSendClientResultsLink(String(value) === 'yes');
  };

  const optionalFields = (
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
  );

  return (
    <div className={className}>
      <div
        id="intake-link"
        className="mt-2 flex h-10 items-center justify-between rounded-md border border-gray-100 bg-gray-100 px-2 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
      >
        <p className="mr-2 max-w-60 truncate text-gray-700 md:max-w-sm">
          {intakeFormUrl}
        </p>
        <div className="ml-1 flex shrink-0 items-center gap-1">
          <Tooltip title={<p className="text-sm">{tooltipText}</p>}>
            <Button
              onClick={copyLinkToClipboard}
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-gray-200"
            >
              {showCheckmark ? (
                <BsCheckLg className="h-4 w-4 text-green-600" />
              ) : (
                <MdOutlineContentCopy className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
          <Tooltip title={<p className="my-auto">Open</p>}>
            <Button
              onClick={handleOpenIntakeForm}
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-gray-200"
            >
              <HiOutlineExternalLink className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        className="mt-2 flex justify-end"
      >
        <AccordionItem
          value="optional-fields"
          className="border-none text-sm"
        >
          <AccordionTrigger
            className="flex justify-end gap-2 text-gray-700"
            withBackground={false}
          >
            Additional Settings
          </AccordionTrigger>
          <AccordionContent className="px-1.5">
            {optionalFields}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
