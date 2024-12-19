import classNames from 'classnames';

type CtaButtonProps = {
  className?: string;
  buttonLabel: string;
  startIcon?: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
};
export function CtaButton({
  className,
  buttonLabel,
  startIcon,
  secondary,
  onClick,
}: CtaButtonProps) {
  return (
    <button
      className={classNames(
        className,
        `${secondary ? 'border border-darkPurple text-darkPurple  hover:bg-gray-50 focus-visible:outline-darkPurple' : 'focus-visible:white bg-darkPurple text-white hover:bg-mediumPurple '} rounded-md px-5 py-2 text-center text-base shadow-sm  hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:text-lg`,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {startIcon && startIcon}
        <p className="flex-grow font-medium">{buttonLabel}</p>
      </div>
    </button>
  );
}
