import { CSSProperties } from 'react';
import mainStyles from '../styles/main.module.css';
import slideStyles from './CareHoursChart.module.css';
import { formatThousands } from '@shared';
import classNames from 'classnames';

const styles = {
  ...mainStyles,
  ...slideStyles,
};

type CareHoursChartProps = Pick<AllPhaseCosts, 'allPhaseFamilyProvidedPercent'>;

interface PieSegmentDataLabelProps {
  className: string;
  careHoursProvided: number;
  text: string;
}

export function CareHoursChart({
  allPhaseFamilyProvidedPercent,
}: CareHoursChartProps) {
  const breakpointAngle = Math.round(360 * allPhaseFamilyProvidedPercent);
  const chartStyle: CSSProperties = {
    background: `conic-gradient(
      from 270deg,
      #A798E5 0 ${breakpointAngle}deg,
      #3D1C7C ${breakpointAngle}deg 360deg)`,
  };

  return (
    <div
      className={styles.chart}
      style={chartStyle}
    />
  );
}

export function PieSegmentDataLabel({
  className,
  careHoursProvided,
  text,
}: PieSegmentDataLabelProps) {
  return (
    <div className={classNames(styles.dataLabelContainer, className)}>
      <span className={styles.dataLabelValue}>
        {formatThousands(careHoursProvided)}
      </span>
      <span className={styles.dataLabelUnit}>{' hours'}</span>1
      <div className={styles.dataLabelText}>{text}</div>
    </div>
  );
}
