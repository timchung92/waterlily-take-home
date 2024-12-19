import { ReactNode } from 'react';

interface SlideContentProps {
  children: ReactNode;
  headerText: ReactNode;
  headerSubText?: ReactNode;
}

export function SlideContent({
  children,
  headerText,
  headerSubText,
}: SlideContentProps) {
  return (
    <div className="container mx-auto pt-2 md:px-8 md:pt-9">
      <div className="mx-auto flex max-w-4xl flex-col text-darkPurple">
        <div className="relative mt-3 w-full flex-none">
          <SlideHeader headerText={headerText} />
          {headerSubText && <SlideSubHeader headerSubText={headerSubText} />}
        </div>
        {children}
      </div>
    </div>
  );
}

interface SlideHeaderProps {
  headerText: ReactNode;
}

function SlideHeader({ headerText }: SlideHeaderProps) {
  return (
    <h1 className="text-2xl font-semibold leading-tight text-darkPurple md:text-4xl">
      {headerText}
    </h1>
  );
}

interface SlideSubHeaderProps {
  headerSubText: ReactNode;
}

function SlideSubHeader({ headerSubText }: SlideSubHeaderProps) {
  return (
    <h3 className="mt-2 pt-1 text-base font-normal leading-7 text-gray-700 md:mt-1 md:text-xl/8">
      {headerSubText}
    </h3>
  );
}
