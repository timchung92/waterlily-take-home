import { Users, Settings2, ShieldAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  cn,
  DisqualifyingConditionsDialog,
  EditCareAssumptionsModal,
} from '..';
import { useState } from 'react';
import { SendPartnerLinkRequestModal } from './SendPartnerLinkRequestModal';
import { isNullOrUndefined } from '@shared';

type CustomizePlanButtonProps = {
  client: Client;
  className?: string;
  showStressTestBtn?: boolean;
  showLinkPartnerBtn?: boolean;
  showDisqualifyingConditionsBtn?: boolean;
  useDefaultLayout?: boolean;
  useIconOnlyOnMobile?: boolean;
};

const BUTTON_BASE_CLASSES =
  'flex w-full items-center gap-2 text-gray-600 font-medium  px-1.5 md:px-3';
const ICON_WRAPPER_CLASSES = 'flex w-5 justify-center';
const BUTTON_TEXT_CLASSES = 'text-xs md:text-sm ';

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  show?: boolean;
  useIconOnlyOnMobile?: boolean;
};

function ActionButton({
  icon,
  label,
  onClick,
  show = true,
  useIconOnlyOnMobile = false,
}: ActionButtonProps) {
  if (!show) return null;

  return (
    <Button
      variant="outline"
      className={cn(
        BUTTON_BASE_CLASSES,
        useIconOnlyOnMobile && 'px-2  md:px-3',
      )}
      onClick={onClick}
    >
      <div className={ICON_WRAPPER_CLASSES}>{icon}</div>
      <span
        className={cn(
          BUTTON_TEXT_CLASSES,
          useIconOnlyOnMobile && 'hidden md:inline',
        )}
      >
        {label}
      </span>
    </Button>
  );
}

export function CustomizePlanButtonGroup({
  className,
  client,
  showStressTestBtn = true,
  showLinkPartnerBtn = true,
  showDisqualifyingConditionsBtn = true,
  useDefaultLayout = true,
  useIconOnlyOnMobile = false,
}: CustomizePlanButtonProps) {
  const { mutableClientPartner } = client;
  const [openStressTestModal, setOpenStressTestModal] = useState(false);
  const [openLinkPartnerModal, setOpenLinkPartnerModal] = useState(false);
  const [
    openDisqualifyingConditionsDialog,
    setOpenDisqualifyingConditionsDialog,
  ] = useState(false);

  const showLinkPartnerBtnOverride =
    showLinkPartnerBtn && isNullOrUndefined(mutableClientPartner?.clientId);

  const actions = [
    {
      icon: <Settings2 className="h-4 w-4" />,
      label: 'Edit care assumptions',
      onClick: () => setOpenStressTestModal(true),
      show: showStressTestBtn,
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Link partner account',
      onClick: () => setOpenLinkPartnerModal(true),
      show: showLinkPartnerBtnOverride,
    },
    {
      icon: <ShieldAlertIcon className="h-4 w-4" />,
      label: 'View policy ineligibility',
      onClick: () => setOpenDisqualifyingConditionsDialog(true),
      show: showDisqualifyingConditionsBtn,
    },
  ];

  return (
    <>
      <div
        className={cn(
          ' text-gray-600',
          useDefaultLayout &&
            'flex flex-row gap-1 lg:absolute lg:mb-2 lg:ml-auto lg:mt-2 lg:flex-col lg:gap-2 lg:self-end',
          className,
        )}
      >
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            {...action}
            useIconOnlyOnMobile={useIconOnlyOnMobile}
          />
        ))}
      </div>

      <EditCareAssumptionsModal
        open={openStressTestModal}
        setOpen={setOpenStressTestModal}
      />

      <SendPartnerLinkRequestModal
        open={openLinkPartnerModal}
        onClose={() => setOpenLinkPartnerModal(false)}
      />
      <DisqualifyingConditionsDialog
        client={client}
        open={openDisqualifyingConditionsDialog}
        onClose={() => setOpenDisqualifyingConditionsDialog(false)}
      />
    </>
  );
}
