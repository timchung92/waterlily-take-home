import Timeline from '@mui/lab/Timeline';
import TimelineItemComponent from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import WheelchairPickupOutlinedIcon from '@mui/icons-material/WheelchairPickupOutlined';
import DomainAddOutlinedIcon from '@mui/icons-material/DomainAddOutlined';
import AssistWalkerOutlinedIcon from '@mui/icons-material/AssistWalkerOutlined';
import Typography from '@mui/material/Typography';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import mainStyles from '../styles/main.module.css';
import componentStyles from './CarePhaseTimeline.module.css';
import { defaultChartColors } from '../util';
import React from 'react';
import {
  CarePhaseDef,
  CarePhase,
  carePhaseDefList,
  isNullOrUndefined,
  formatInteger,
} from '@shared';

const styles = {
  ...mainStyles,
  ...componentStyles,
};

const fontLato = { fontFamily: '"Lato" !important' };

interface TimelinePhaseDescriptionProps {
  adlRange: string;
  duration: JSX.Element;
}

const TimelinePhaseDescription: React.FC<TimelinePhaseDescriptionProps> = ({
  adlRange,
  duration,
}) => {
  const sxProps = { ...fontLato, fontWeight: 400, fontSize: '1.1rem' };
  return (
    <>
      <Typography sx={sxProps}>
        Phase requiring assistance with{' '}
        <span style={{ fontWeight: 600 }}>
          {adlRange} basic self-care tasks
        </span>
      </Typography>
      <Typography sx={{ ...sxProps }}>{duration}</Typography>
    </>
  );
};

interface TimelineItemProps {
  time: string;
  title: string;
  description: JSX.Element;
  icon: React.ComponentType<SvgIconProps>;
  colorIndex: number;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  time,
  title,
  description,
  icon: Icon,
  colorIndex,
}) => (
  <TimelineItemComponent>
    <TimelineOppositeContent
      sx={{ ...fontLato, m: 'auto 0', minWidth: '200px', fontSize: '1.1rem' }}
    >
      {time}
    </TimelineOppositeContent>
    <TimelineSeparator>
      <TimelineConnector />
      <TimelineDot
        sx={{ background: defaultChartColors[colorIndex] }}
        color="inherit"
        className={styles.avatarDot}
      >
        <Icon fontSize="large" />
      </TimelineDot>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent sx={{ py: '18px', px: 2 }}>
      <Typography
        sx={{
          ...fontLato,
          color: defaultChartColors[colorIndex],
          lineHeight: '1.4',
          fontSize: '1.6rem',
        }}
        component="span"
      >
        {title}
      </Typography>
      {description}
    </TimelineContent>
  </TimelineItemComponent>
);

function findEntryByValue(value: CarePhase): CarePhaseDef | undefined {
  return carePhaseDefList.find(entry => entry.value === value);
}

function determineTimelineTimeText(
  client: Client,
  carePhase: CarePhase,
  phaseIndex: number,
) {
  const {
    phaseCosts,
    clientPhasePredictedStartYears,
    intakeSurvey: {
      clientPhaseStartAges,
      clientCurrentCarePhase,
      clientBirthYear,
    },
  } = client;

  // present if current phase is equal to the phase
  if (clientCurrentCarePhase === carePhase) {
    return `Since ${clientPhaseStartAges[carePhase]! + clientBirthYear}`;
  }

  const carePhaseDef = findEntryByValue(carePhase);
  // future if current phase is null or undefined
  if (isNullOrUndefined(clientCurrentCarePhase)) {
    return `Predicted begin ${clientPhasePredictedStartYears[carePhase]}`;
  }

  // past if current phase index is greater than the phase index
  const clientCurrentCarePhaseDef = findEntryByValue(clientCurrentCarePhase);
  if (clientCurrentCarePhaseDef!.index > phaseIndex) {
    return `Past`;
  }

  // future if current phase index is less than the phase index
  return `Predicted begin ${clientPhasePredictedStartYears[carePhase]}`;
}

interface CarePhaseTimelineProps {
  client: Client;
}

const CarePhaseTimeline: React.FC<CarePhaseTimelineProps> = ({ client }) => {
  const {
    phaseCosts,
    intakeSurvey: { clientCurrentCarePhase },
  } = client;
  const formatDurationText = (singlePhaseCosts: SinglePhaseCosts) => {
    const durationMonths = (
      <span style={{ fontWeight: 600 }}>
        {formatInteger(singlePhaseCosts.phaseCareMonthsNeeded)} months
      </span>
    );

    return singlePhaseCosts.phaseCareMonthsNeeded === 0 ? (
      <></>
    ) : singlePhaseCosts.carePhase === clientCurrentCarePhase ? (
      <>Predicted remaining duration: {durationMonths}</>
    ) : (
      <>Predicted duration: {durationMonths}</>
    );
  };

  const phases = [
    {
      time: determineTimelineTimeText(client, CarePhase.earlyCare, 0),
      title: carePhaseDefList[0].label,
      description: (
        <TimelinePhaseDescription
          adlRange="1-2"
          duration={formatDurationText(phaseCosts[0])}
        />
      ),
      icon: AssistWalkerOutlinedIcon,
      colorIndex: 0,
    },
    {
      time: determineTimelineTimeText(client, CarePhase.moderateCare, 1),
      title: carePhaseDefList[1].label,
      description: (
        <TimelinePhaseDescription
          adlRange="3-4"
          duration={formatDurationText(phaseCosts[1])}
        />
      ),
      icon: WheelchairPickupOutlinedIcon,
      colorIndex: 1,
    },
    {
      time: determineTimelineTimeText(client, CarePhase.fullCare, 2),
      title: carePhaseDefList[2].label,
      description: (
        <TimelinePhaseDescription
          adlRange="5-6"
          duration={formatDurationText(phaseCosts[2])}
        />
      ),
      icon: DomainAddOutlinedIcon,
      colorIndex: 2,
    },
  ];

  return (
    <div className={styles.carePhaseTimelineContainer}>
      <Timeline
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.06,
          },
          padding: 0,
        }}
      >
        {phases.map((phase, index) => (
          <TimelineItem
            key={index}
            {...phase}
          />
        ))}
      </Timeline>
    </div>
  );
};

export default CarePhaseTimeline;
