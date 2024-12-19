import { isNullUndefinedOrEmpty } from '@shared';
import React from 'react';

interface CompanyLogoContainerProps {
  advisor: Advisor | Partial<Advisor>;
  containerClassName?: string;
  organizationNameClassName?: string;
  subtextClassName?: string;
}

function formatOrgDisplayName(input: string): string {
  return input.replace(/\b[a-z]/g, (char, index, sentence) => {
    // Check if the previous character is an apostrophe
    if (index > 0 && sentence[index - 1] === "'") {
      return char;
    }
    return char.toUpperCase();
  });
}

const CompanyLogoContainer: React.FC<CompanyLogoContainerProps> = ({
  advisor,
  containerClassName,
  organizationNameClassName,
  subtextClassName,
}) => {
  return (
    <div
      className={
        containerClassName
          ? containerClassName
          : 'mr-5 flex flex-col items-start'
      }
      id="white-label-container"
    >
      {!isNullUndefinedOrEmpty(advisor.organizationDisplayName) ? (
        <>
          {/** Do not remove whitelabel-logo id, it is used for pdf report generation */}
          <div
            id="whitelabel-logo"
            className={
              organizationNameClassName
                ? organizationNameClassName
                : '-top-3 mr-5 text-base font-bold text-darkPurple md:text-xl'
            }
          >
            {formatOrgDisplayName(advisor.organizationDisplayName)}
          </div>
          <div
            className={
              subtextClassName
                ? subtextClassName
                : 'ml-5 text-sm text-darkPurple md:ml-8 md:text-base'
            }
          >
            powered by Waterlily
          </div>
        </>
      ) : (
        <div className="mt-2 text-2xl font-semibold text-darkPurple md:text-3xl">
          Waterlily
        </div>
      )}
    </div>
  );
};

export default CompanyLogoContainer;

// interface CompanyLogoProps {
//   companyName: string;
//   logoUrl: string; // Optional property for logo URL
//   logoClassName: string;
//   companyNameClassName: string;
// }

// export const CompanyLogo: React.FC<CompanyLogoProps> = ({ companyName, logoUrl, logoClassName, companyNameClassName }) => {
//   const [isValidImage, setIsValidImage] = useState<boolean>(false);

//   const handleImageLoad = () => {
//     console.log('Image loaded')
//     setIsValidImage(true);
//   };

//   return (
//      <>
//       {isValidImage && (
//         <img
//           src={logoUrl}
//           alt={companyName}
//           className={logoClassName}
//           onLoad={handleImageLoad}
//         />
//       )}
//       {!isValidImage && (
//         <div className={companyNameClassName}>{companyName}</div>
//       )}
//     </>
//   );
// };
