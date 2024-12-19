import {
  ChangeEvent,
  FocusEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, ButtonGroup, Input, InputProps, styled } from '@mui/material';
import classNames from 'classnames';
import {
  createFixedNumberValidator,
  formatCurrency,
  formatInteger,
  formatPercent,
  formatThousands,
  formatUnlimitedCurrency,
  isIntegerOrNull,
  isNullOrUndefined,
  isPercentOrNull,
  isRealNumber,
  isRealNumberOrNull,
  parseInteger,
  parseUnlimitedCurrency,
  parseWholeNumberToPercent,
  toRecord,
} from '@shared';
import styles from './NumericInput.module.css';

export interface NumericInputClassNames {
  container?: string;
  label?: string;
  box?: string;
  disabledBox?: string;
  errorBox?: string;
  control?: string;
  unit?: string;
  errorText?: string;
  stepper?: string;
}

export interface NumericInputProps
  extends Omit<InputProps, 'value' | 'onChange'> {
  classNames?: NumericInputClassNames;
  label: string;
  errorMessage?: string;
  formatter?(value: number | null): string;
  parser?(rawValue: string): number | null;
  unit?: string;
  value: number | null;
  onChange(value: number | null): void;
  onPreview?(value: number | null, event: ChangeEvent<HTMLInputElement>): void;
  validator?(
    value: number | null,
    event: ChangeEvent<HTMLInputElement>,
  ): boolean;
  showStepper?: boolean;
}

export function NumericInput(props: NumericInputProps) {
  const {
    className,
    classNames: propClassNames = {},
    disabled,
    errorMessage,
    formatter = kindaSmartNumberFormatter,
    label,
    onBlur,
    onChange,
    onFocus,
    onPreview,
    parser = Number.parseFloat,
    unit,
    validator = isRealNumberOrNull,
    value,
    showStepper,
    ...restProps
  } = props;

  const [lastIncomingValue, setLastIncomingValue] = useState(value);
  const [editingValue, setEditingValue] = useState(formatter(value));
  const [validValue, setValidValue] = useState(value);
  const [hasFocus, setHasFocus] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!hasFocus && value !== lastIncomingValue) {
      setLastIncomingValue(value);
      setEditingValue(formatter(value));
    }
  }, [hasFocus, lastIncomingValue, setLastIncomingValue, value]);

  const broadcastChange = useCallback(
    (value: number | null) => {
      setIsDirty(false);
      onChange(value);
    },
    [onChange, setIsDirty],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;

      setEditingValue(rawValue);

      const cleanedValue = rawValue.replace(/[$+,% ]/g, '');

      const newValue = cleanedValue.length === 0 ? null : parser(cleanedValue);

      const newValid = !Number.isNaN(newValue) && validator?.(newValue, event);
      setIsValid(newValid);

      if (newValid) {
        setValidValue(newValue);

        if (hasFocus) {
          setIsDirty(newValue !== validValue);
          onPreview?.(newValue, event);
        } else {
          broadcastChange(newValue);
        }
      } else {
        setValidValue(null);
      }
    },
    [
      broadcastChange,
      hasFocus,
      onChange,
      onPreview,
      parser,
      setEditingValue,
      setIsDirty,
      setIsValid,
      setValidValue,
      validator,
    ],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setHasFocus(true);
      setIsValid(true);
      onFocus?.(event);
    },
    [onFocus, setHasFocus, setIsValid],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setHasFocus(false);
      if (isValid && isDirty) {
        broadcastChange(validValue);
      }
    },
    [broadcastChange, hasFocus, isDirty, isValid, validValue],
  );

  const appliedStyles = toRecord(
    Object.entries(styles),
    ([key]) => key as keyof NumericInputClassNames,
    ([key, value]) =>
      `numericInput ${value} ${propClassNames[key as keyof NumericInputClassNames] ?? ''}`,
  );

  if (className) {
    appliedStyles.container = `${appliedStyles.container} ${className}`;
  }

  return (
    <div className={appliedStyles.container}>
      <div className={appliedStyles.label}>{label}</div>
      <div
        className={classNames(appliedStyles.box, {
          [appliedStyles.disabledBox]: disabled,
          [appliedStyles.errorBox]: !isValid,
        })}
      >
        <Input
          className={appliedStyles.control}
          disableUnderline={true}
          value={editingValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={disabled}
          fullWidth
          {...restProps}
        />
        {unit ? <div className={appliedStyles.unit}>{unit}</div> : null}
        {showStepper ? (
          <Stepper
            validValue={validValue!}
            disabled={disabled}
            setValidValue={setValidValue}
            broadcastChange={broadcastChange}
          />
        ) : null}
        {isValid || isNullOrUndefined(errorMessage) ? null : (
          <div className={appliedStyles.errorText}>{errorMessage}</div>
        )}
      </div>
    </div>
  );
}

export function IntegerInput(props: NumericInputProps) {
  return (
    <NumericInput
      formatter={formatInteger}
      parser={parseInteger}
      validator={isIntegerOrNull}
      {...props}
    />
  );
}

export function ThousandsIntegerInput(props: NumericInputProps) {
  return (
    <NumericInput
      formatter={formatThousands}
      parser={parseInteger}
      validator={isIntegerOrNull}
      {...props}
    />
  );
}

export function CurrencyInput(props: NumericInputProps) {
  return (
    <NumericInput
      formatter={formatCurrency}
      parser={Number.parseFloat}
      validator={createFixedNumberValidator(2, true)}
      {...props}
    />
  );
}

export function PercentInput(props: NumericInputProps) {
  return (
    <NumericInput
      formatter={formatPercent}
      parser={parseWholeNumberToPercent}
      validator={isPercentOrNull}
      {...props}
    />
  );
}

export function UnlimitedCurrencyInput(props: NumericInputProps) {
  return (
    <NumericInput
      formatter={formatUnlimitedCurrency}
      parser={parseUnlimitedCurrency}
      validator={createFixedNumberValidator(2, true)}
      {...props}
    />
  );
}

export function kindaSmartNumberFormatter(value: number | null) {
  if (!isRealNumber(value)) {
    return '';
  }

  const text = String(value);
  const periodPos = text.indexOf('.');

  if (periodPos === -1) {
    return text;
  }

  if (text.substring(periodPos, periodPos + 5) === '.0000') {
    return text.substring(0, periodPos);
  }

  if (text.length > periodPos + 3) {
    return (Math.round(value * 100) / 100).toString();
  }

  return text;
}

const StepperButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  '& .MuiButton-root': {
    'minWidth': '20px',
    'padding': 0,
    'height': '23.5px',
    'backgroundColor': 'transparent',
    'border': 'none',
    'color': '#454446',
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
      border: 'none',
    },
    '&:disabled': {
      border: 'none',
      color: theme.palette.grey[400],
    },
  },
}));

function Stepper({
  validValue,
  disabled,
  setValidValue,
  broadcastChange,
}: {
  validValue: number;
  disabled: boolean | undefined;
  setValidValue: React.Dispatch<React.SetStateAction<number | null>>;
  broadcastChange: (value: number | null) => void;
}) {
  const incrementValue = () => {
    setValidValue(validValue => {
      broadcastChange(validValue! + 100);
      return validValue! + 100;
    });
  };

  const decrementValue = () => {
    setValidValue(validValue => {
      let newValue = validValue! - 100;
      if (newValue < 0) {
        newValue = 0;
      }
      broadcastChange(newValue);
      return newValue;
    });
  };

  const stepperInterval = useRef<NodeJS.Timeout | null>(null);

  const incrementHoldStart = () => {
    stepperInterval.current = setInterval(incrementValue, 500);
  };

  const decrementHoldStart = () => {
    stepperInterval.current = setInterval(decrementValue, 500);
  };

  const holdEnd = useCallback(() => {
    clearInterval(stepperInterval.current!);
  }, []);

  return (
    <div className={styles.stepper}>
      <StepperButtonGroup
        size="small"
        orientation="vertical"
      >
        <Button
          disabled={disabled}
          onClick={incrementValue}
          onMouseDown={incrementHoldStart}
          onMouseUp={holdEnd}
        >
          &#9650;
        </Button>
        <Button
          disabled={disabled}
          onClick={decrementValue}
          onMouseDown={decrementHoldStart}
          onMouseUp={holdEnd}
        >
          &#9660;
        </Button>
      </StepperButtonGroup>
    </div>
  );
}
