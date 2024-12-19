interface AnnuityFieldProps {
  title: string;
  description: string | React.ReactNode;
  children: React.ReactNode;
  isLastField?: boolean;
}

export function AnnuityField({
  title,
  description,
  children,
  isLastField,
}: AnnuityFieldProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-y-1  py-7 md:grid-cols-2 md:gap-x-6 ${
        isLastField ? '' : 'border-b'
      }`}
    >
      <div className="col-span-1 flex flex-col gap-2 pb-2 md:col-span-2">
        <h2 className="text-lg leading-5 text-darkPurple">{title}</h2>
        <p className="text-sm text-gray-700 md:text-base">{description}</p>
      </div>
      <div className="col-span-1">{children}</div>
    </div>
  );
}
