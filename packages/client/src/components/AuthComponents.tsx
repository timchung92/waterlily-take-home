import { ChangeEvent } from 'react';
import { WaterlilyLogo } from './WaterlilyLogo';
import { cn } from '@/lib/utils';
import { LoadingState } from './LoadingState';
import { MdCheckCircle } from 'react-icons/md';

function AuthBox(props: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        `mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]`,
        props.className,
      )}
    >
      <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
        {props.children}
      </div>
    </div>
  );
}

type AuthContainerProps = {
  children: React.ReactNode;
  title: string;
  outsideBoxChildren?: React.ReactNode;
  successState?: boolean;
  warningState?: boolean;
  isLoading?: boolean;
};

export function AuthContainer(props: AuthContainerProps) {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center overflow-y-hidden bg-gray-100 py-12 sm:px-6 lg:px-8">
      <AuthHeader title={props.title} />
      <AuthBox
        className={cn(
          props.successState ? 'rounded-lg border-t-4 border-t-green-500' : '',
          props.warningState ? 'rounded-lg border-t-4 border-t-yellow-500' : '',
        )}
      >
        {props.children}
        <LoadingState isLoading={props.isLoading} />
      </AuthBox>
      <div className="mt-4 text-center text-sm text-gray-600">
        {props.outsideBoxChildren}
      </div>
    </div>
  );
}

type AuthHeaderProps = {
  title: string;
};

function AuthHeader(props: AuthHeaderProps) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <WaterlilyLogo className="mx-auto h-10 w-auto rounded-sm md:h-12" />
      {props.title && (
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {props.title}
        </h2>
      )}
    </div>
  );
}

type AuthInputTextFieldProps = {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error: boolean | undefined;
  description?: string;
};

export function AuthInputTextField({
  id,
  label,
  type,
  placeholder,
  required = true,
  value,
  onChange,
  error,
  autoComplete,
  className,
  description,
}: AuthInputTextFieldProps) {
  return (
    <div className={cn('mt-2', className)}>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>

      {description && (
        <p className="mb-1 text-sm text-gray-500">{description}</p>
      )}

      <input
        id={id}
        name={id}
        type={type ?? id}
        required={required}
        autoComplete={autoComplete}
        className={`block w-full rounded-md border-0 bg-white px-2 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple sm:text-sm sm:leading-6 ${
          error ? 'ring-red-500' : ''
        }`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

type AuthInputDisabledFieldProps = {
  label: string;
  id: string;
  autoComplete?: string;
  value: string | undefined;
  className?: string;
};

export function AuthInputDisabledField({
  id,
  label,
  autoComplete,
  value,
  className,
}: AuthInputDisabledFieldProps) {
  return (
    <div className={cn('mt-2', className)}>
      <label
        htmlFor={id}
        className="my-1 block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={id}
        autoComplete={autoComplete ?? 'off'}
        disabled
        className={`block w-full rounded-md border-0 bg-gray-100 px-2 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 `}
        value={value}
      />
    </div>
  );
}

export function AuthSubmitButton(props: { title: string }) {
  return (
    <button
      type="submit"
      className="flex w-full justify-center rounded-md bg-darkPurple px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-mediumPurple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {props.title}
    </button>
  );
}

export function AuthPrimaryButton(props: {
  title: string;
  onClick: (() => void) | undefined;
}) {
  return (
    <button
      onClick={props.onClick}
      className="flex w-full justify-center rounded-md bg-darkPurple px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-mediumPurple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {props.title}
    </button>
  );
}

export function AuthSuccessMessage(props: { title: string; message: string }) {
  return (
    <div className="flex max-w-xl flex-col items-center gap-4 px-4 py-8">
      <div className="flex items-center gap-3">
        <MdCheckCircle className="h-8 w-8 text-green-500" />
        <h2 className="text-xl font-medium text-gray-900"> {props.title}</h2>
      </div>
      <p className="text-center text-base text-gray-600 md:text-base">
        {props.message}
      </p>
    </div>
  );
}
