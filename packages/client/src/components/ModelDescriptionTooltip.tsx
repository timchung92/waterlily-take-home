import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import styles from '../styles/main.module.css';
import { isNullOrUndefined } from '@shared/isNullOrUndefined';

interface ModelDescriptionTooltipProps {
  tooltipContent: React.ReactNode;
  placement?: string;
  children?: JSX.Element;
}

export function ModelDescriptionTooltip({
  tooltipContent,
  placement,
  children,
}: ModelDescriptionTooltipProps) {
  return (
    <>
      <Tooltip
        enterTouchDelay={0}
        leaveTouchDelay={3000}
        classes={{ tooltip: styles.modelDescriptionTooltipContainer }}
        title={tooltipContent}
        placement={isNullOrUndefined(placement) ? 'right' : (placement as any)}
        arrow
      >
        {children || (
          <span className={styles.infoIconContainer}>
            <InfoOutlinedIcon
              fontSize="small"
              className="absolute"
            />
          </span>
        )}
      </Tooltip>
    </>
  );
}
