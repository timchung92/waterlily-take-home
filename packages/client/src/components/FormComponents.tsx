import { UseFormRegister, FieldValues, FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FaCaretDown, FaCaretUp, FaCheck } from 'react-icons/fa';
import ClipLoader from 'react-spinners/ClipLoader';
import { useEffect, useRef, useState } from 'react';

type FormTextInputProps<T extends FieldValues> =
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    id: string;
    error: FieldError | undefined;
    register: ReturnType<UseFormRegister<T>>;
    unit?: string;
    className?: string;
    helperText?: string;
    stepper?: boolean;
  };

export function FormInput<T extends FieldValues>({
  id,
  label,
  error,
  register,
  unit,
  className,
  stepper,
  helperText,
  ...inputProps
}: FormTextInputProps<T>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const inputEl = inputRef.current;
    if (inputEl && inputProps.type === 'number') {
      const preventScroll = (e: WheelEvent) => e.preventDefault();
      inputEl.addEventListener('wheel', preventScroll);

      return () => {
        inputEl.removeEventListener('wheel', preventScroll);
      };
    }
  }, [inputProps.type]);

  const showStepper = inputProps.type === 'number' && stepper;

  return (
    <div className="">
      <label
        htmlFor={id}
        className="my-1 block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className={cn('relative mt-1 rounded-md shadow-sm', className)}>
        <input
          id={id}
          className={cn(
            `block w-full rounded-md border-0 bg-white px-2 py-2  text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6 `,
            error ? 'ring-red-500' : '',
            inputProps.disabled ? 'bg-gray-100' : '',
          )}
          style={{
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
          }}
          {...inputProps}
          {...register}
          onChange={inputProps.onChange}
        />
        {unit && (
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 flex items-center ',
              showStepper ? 'pr-16' : 'pr-8',
            )}
          >
            <span className="text-gray-500 sm:text-sm">{unit}</span>
          </div>
        )}
        {/* Stepper buttons */}
        {showStepper && <Stepper id={id} />}
      </div>
      {helperText && (
        <p className="ml-1 mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

type StepperProps = {
  id: string;
};

export function Stepper({ id }: StepperProps) {
  const handleStepUp = () => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) input.stepUp();
  };

  const handleStepDown = () => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) input.stepDown();
  };

  return (
    <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
      <button
        type="button"
        onClick={handleStepUp}
        className="my-auto rounded bg-gray-200 px-1 py-1 text-xs text-gray-600 hover:bg-gray-300"
      >
        <FaCaretUp className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={handleStepDown}
        className="my-auto rounded bg-gray-200 px-1 py-1 text-xs text-gray-600 hover:bg-gray-300"
      >
        <FaCaretDown className="h-3 w-3 -translate-y-[1px]" />
      </button>
    </div>
  );
}

type SubmitButtonProps = {
  label: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  complete?: boolean;
  completeText?: string;
  onClick?: () => void;
};

export function SubmitButton({
  label,
  className,
  isLoading = false, // Default isLoading to false
  disabled,
  complete,
  completeText,
  onClick,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled} // Disable button when loading
      onClick={onClick}
      className={cn(
        'flex flex-shrink-0 items-center rounded-md bg-darkPurple px-4 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-darkPurple',
        isLoading || disabled ? 'opacity-50' : 'hover:bg-mediumPurple',
        complete &&
          'cursor-default bg-green-50 text-green-500 ring-1 ring-green-500 hover:bg-green-50',
        className,
      )}
    >
      {isLoading && (
        <ClipLoader
          size={15}
          color="#94a3b8"
          className="mr-2 h-3 w-3 text-white"
        />
      )}
      {complete && <FaCheck className="mr-1.5 h-3 w-3 text-green-500" />}{' '}
      {complete ? completeText : label}
    </button>
  );
}

type SecondaryFormButtonProps = SubmitButtonProps & {
  textButton?: boolean;
};
export function SecondaryFormButton({
  label,
  className,
  textButton,
  onClick,
  disabled,
}: SecondaryFormButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex flex-shrink-0 items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-darkPurple',
        textButton
          ? 'underline hover:no-underline'
          : 'ring-1 ring-gray-300 hover:bg-gray-100',
        className,
      )}
    >
      {label}
    </button>
  );
}

type FormHeaderProps = {
  title: string;
  className?: string;
};

export function FormHeader({ title, className }: FormHeaderProps) {
  return (
    <div className={cn('mt-5', className)}>
      <h4 className="whitespace-nowrap text-lg text-gray-900">{title}</h4>
    </div>
  );
}

export function FormDivider({ className }: { className?: string }) {
  return <hr className={cn('my-4 border-gray-200', className)} />;
}

export function PrimarySecondaryButtonContainer({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-row-reverse items-center gap-2 py-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
