import classNames from 'classnames';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type ButtonProps = {
  className?: string;
  buttonLabel: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  underline?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  hide?: boolean;
  href?: string;
};

export function TextButton(props: ButtonProps) {
  if (props.hide) {
    return null;
  }

  const combinedClassName = cn(
    `flex items-center gap-2 text-base font-semibold text-darkPurple  hover:text-purple hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-darkPurple`,
    `${props.underline ? 'underline' : ''}`,
    props.className,
  );

  // link button
  if (props.href) {
    return (
      <button className={combinedClassName}>
        <Link
          to={props.href}
          target="_blank"
        >
          {props.startIcon && props.startIcon}
          {props.buttonLabel}
          {props.endIcon && props.endIcon}
          {props.children}
        </Link>
      </button>
    );
  }

  return (
    <button
      className={combinedClassName}
      onClick={props.onClick}
    >
      {props.startIcon && props.startIcon}
      {props.buttonLabel}
      {props.endIcon && props.endIcon}
      {props.children}
    </button>
  );
}
