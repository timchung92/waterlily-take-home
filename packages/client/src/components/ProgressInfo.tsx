import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
import styles from '../styles/main.module.css';
import classNames from 'classnames';

interface ProgressInfoProps {
  className?: string;
}

export function ProgressInfo({ className }: ProgressInfoProps) {
  return (
    <Tooltip
      classes={{ tooltip: styles.tooltipContainer }}
      title={
        <span className={styles.tooltipContent}>
          This metric refers to the progress you&apos;re making in developing a comprehensive Waterlily
          plan. You can make more progress via visiting your Action Tags in either your Advisor
          Dashboard or Client Dashboard. Getting to 100% is a function of completing all possible
          Action Tags for this client, so please navigate per Action Item given in the Action Tags.
        </span>
      }
      >
        <span className={classNames(styles.progressInfoContainer, className)}>
          <InfoIcon className={styles.progressInfoIcon} />
        </span>
      </Tooltip>
  )
}