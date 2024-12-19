import classNames from 'classnames';
import { startCase, identity, noop } from 'lodash';
import mainStyles from '../styles/main.module.css';
import slideStyles from './HorizontalStackedLineChart.module.css';
import { PageLink, PageLinkProps, defaultChartColors } from '..';
import { FunctionComponent, MouseEvent, ReactNode, useCallback } from 'react';
import { isNullOrUndefined } from '@shared/isNullOrUndefined';
import { ModelDescriptionTooltip } from './ModelDescriptionTooltip';
import { tooltips } from './Tooltips';

const styles = {
  ...mainStyles,
  ...slideStyles,
};

export interface ChartDataPoint {
  value: number;
  barColor?: string;
  subtext?: ReactNode;
  label?: string;
  labelClassName?: string;
  isSelected?: boolean;
}
interface HorizontalStackedLineChartProps {
  className?: string;
  data: ChartDataPoint[];
  formatter?: (value: number) => string;
  onClickChartSegment?(dataPoint: ChartDataPoint): void;
  reducedFont?: boolean;
}

interface HorizontalStackedLineProps {
  point: ChartDataPoint;
  index: number;
  formatter: NonNullable<HorizontalStackedLineChartProps['formatter']>;
  onClickChartSegment?(dataPoint: ChartDataPoint): void;
  reducedFront: boolean;
}

export function HorizontalStackedLineChart({
  className,
  data,
  formatter = identity,
  onClickChartSegment,
  reducedFont = false,
}: HorizontalStackedLineChartProps) {
  return (
    <div className={classNames(styles.chartContainer, className)}>
      {data?.map((point, index) => (
        <HorizontalStackedLine
          key={index}
          point={point}
          index={index}
          formatter={formatter}
          onClickChartSegment={onClickChartSegment}
          reducedFront={reducedFont}
        />
      ))}
    </div>
  );
}

function HorizontalStackedLine({
  point,
  index,
  formatter,
  onClickChartSegment,
  reducedFront,
}: HorizontalStackedLineProps) {
  const { label, labelClassName, value, subtext, barColor, isSelected } = point;

  const handleClick = useCallback(() => {
    onClickChartSegment?.(point);
  }, [point]);

  const pointClassName = `chart${startCase(label || 'Total')}`;
  const appliedBarColor =
    barColor ?? defaultChartColors[index % defaultChartColors.length];
  const interactiveClassName = isNullOrUndefined(onClickChartSegment)
    ? ''
    : styles.chartInteractive;
  const labelTokens = label?.split(':');

  const chartLabelAndBar = (
    <>
      <div
        className={`${styles.chartLabel} ${pointClassName}Label ${labelClassName}`}
        style={{ color: appliedBarColor }}
      >
        {label && labelTokens?.length === 2 && (
          <>
            {labelTokens[0]}:
            <span
              className={styles.careEnvironmentChartLabel}
              style={{ color: barColor ? appliedBarColor : '#454446' }}
            >
              {' '}
              {labelTokens[1]}
            </span>
          </>
        )}
      </div>
      <div
        className={`${styles.chartBar} ${interactiveClassName} ${pointClassName}Bar`}
        style={{
          backgroundColor: appliedBarColor,
          color: appliedBarColor,
          border: isSelected ? '2px solid #414BB2' : '',
        }}
      >
        <div
          className={classNames(
            `${styles.chartData} ${pointClassName}Data`,
            reducedFront ? 'text-2xl' : '',
          )}
        >
          <>
            {value > 0 ? formatter(value) : '$ ---'}
            {!isNullOrUndefined(subtext) && ( // only the total as subtext, so keying off of that
              <ModelDescriptionTooltip
                tooltipContent={
                  tooltips.slideProjectedCostsProfessionalShareCosts
                }
                placement="top"
              />
            )}
          </>
        </div>
        <div className={`${styles.chartSubtext} ${pointClassName}Citation`}>
          {subtext ?? null}
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`${styles.chartSegment} ${pointClassName}Segment`}
      onClick={handleClick}
    >
      {chartLabelAndBar}
    </div>
  );
}
