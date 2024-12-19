import { BsFillQuestionCircleFill } from 'react-icons/bs';
import { SlideOutSheet, PageLink } from '.';
import { formatCurrency, isNullOrUndefined } from '@shared';
import { careEnvironmentDefs } from '@shared';
import { CustomTooltip } from './CustomTooltip';
import { Badge } from '@/components/ui/badge';
import { AiFillCheckCircle } from 'react-icons/ai';
import { GoDot } from 'react-icons/go';
import { Clock4, DollarSign, MapPinIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCareSettingsPageBy } from '@/util/navigationLogic';

interface PhaseCardProps {
  phase: CarePhaseDataItem;
  carePhase: CarePhase;
  clientId: string;
  clientHasStartedLtc: boolean;
  clientCurrentCarePhase: CarePhase | null;
  client: Client;
  timelineText: string;
  timelineTooltip: string;
}

export interface CarePhaseDataItem {
  value: CarePhase;
  carePhase: string;
  adlRange: string;
  careSettingOptions: string;
  adlRangeIcon: React.ReactElement;
  slideOutContent: React.ReactElement;
  phaseStartAge: number | null;
  phaseCareMonthsNeeded: number;
  selectedCareEnvironment: CareEnvironment | null;
  phaseInflatedProfessionalShareCost: number;
  isDurationCustom: boolean;
}

export function PhaseCard({
  phase,
  carePhase,
  clientId,
  clientHasStartedLtc,
  clientCurrentCarePhase,
  client,
  timelineText,
  timelineTooltip,
}: PhaseCardProps) {
  return (
    <div className="relative">
      <Badge
        variant={phase.value <= carePhase ? 'default' : 'secondary'}
        className={cn(
          'absolute -top-3 left-7 z-10 flex items-center gap-1.5 px-3 py-1',
          phase.value < carePhase
            ? 'bg-green-100 text-green-500 hover:bg-green-100 '
            : '',
          phase.value === carePhase ? 'bg-mediumPurple text-white' : '',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1',
            phase.value <= carePhase ? '' : ' opacity-40',
          )}
        >
          {phase.value < carePhase ? (
            <AiFillCheckCircle className="h-4 w-4" />
          ) : (
            <GoDot className="h-4 w-4" />
          )}
          <CustomTooltip
            content={timelineTooltip}
            className="text-sm"
          >
            <span>{timelineText}</span>
          </CustomTooltip>
        </div>
      </Badge>

      <div
        key={phase.carePhase}
        className={`relative mt-6 rounded-lg border border-darkPurple bg-white px-7 pb-3 pt-7 text-darkPurple shadow-sm lg:pb-7 lg:pt-10 ${
          carePhase === phase.value ? '' : 'opacity-40'
        }`}
      >
        <dl className="flex flex-col gap-1">
          <dt className="flex items-center text-xl font-semibold md:text-2xl">
            {(phase.value === carePhase ||
              !isNullOrUndefined(phase.selectedCareEnvironment)) &&
            getCareSettingsPageBy(phase.value) ? (
              <PageLink
                to={getCareSettingsPageBy(phase.value)!}
                targetProps={{ clientId }}
              >
                {phase.carePhase}
              </PageLink>
            ) : (
              <button className="hover:cursor-default">
                {phase.carePhase}
              </button>
            )}
            <SlideOutSheet
              slideOutContent={phase.slideOutContent}
              title="FAQ"
            >
              <BsFillQuestionCircleFill
                className="h-[18px] w-[18px] pb-1 pl-1  text-gray-400 hover:text-gray-500"
                aria-hidden="true"
              />
            </SlideOutSheet>
          </dt>
          <dd className="mt-1 flex text-base leading-7 text-gray-700">
            <ul>
              <li className="mt-1 flex gap-3">
                <CustomTooltip content="Self-care activities include bathing, dressing, eating, transferrring (e.g.,from bed to chair), toileting, and continence.">
                  {phase.adlRangeIcon}
                  <div>{phase.adlRange} self-care activities</div>
                </CustomTooltip>
              </li>

              <li className="mt-2 flex gap-3">
                <CustomTooltip
                  content={
                    phase.isDurationCustom
                      ? 'Custom Duration'
                      : `Estimated ${clientHasStartedLtc && phase.value === clientCurrentCarePhase ? 'remaining ' : ''}duration`
                  }
                >
                  <Clock4 className="h-4 w-4" />
                  <div>{phase.phaseCareMonthsNeeded} months</div>
                </CustomTooltip>
              </li>

              <li className="mt-2 flex gap-3">
                <CustomTooltip content="Selected care setting">
                  <MapPinIcon className="h-4 w-4" />
                  {phase.selectedCareEnvironment
                    ? `${careEnvironmentDefs[phase.selectedCareEnvironment].label}`
                    : '---'}
                </CustomTooltip>
              </li>

              <li className="mt-2 flex gap-3">
                <CustomTooltip content="Estimated cost">
                  <DollarSign className="h-4 w-4" />
                  {phase.selectedCareEnvironment
                    ? `${formatCurrency(phase.phaseInflatedProfessionalShareCost).slice(1)}`
                    : '---'}
                </CustomTooltip>
              </li>
            </ul>
          </dd>
        </dl>
      </div>
    </div>
  );
}
