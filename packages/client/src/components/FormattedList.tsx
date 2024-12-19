import React from 'react';

type ListItem = {
  label: string;
  value?: string | number;
  subItems?: string[];
  icon?: React.ReactNode;
  subBulletIcon?: React.ReactNode;
};

type FormattedListProps = {
  items: ListItem[];
  className?: string;
};

const FormattedList = ({ items, className = '' }: FormattedListProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="space-y-2"
        >
          <div className="flex items-center gap-1">
            <div className="flex items-baseline">
              <span className="mr-2 text-sm text-gray-700">
                {item.icon ? item.icon : '•'}
              </span>
              <span className="text-gray-700">
                {item.label}
                <span className="font-semibold text-gray-900">
                  {item.value ? ` ${item.value}` : ''}
                </span>
              </span>
            </div>
          </div>
          {item.subItems && item.subItems.length > 0 && (
            <div className="ml-6 space-y-1">
              {item.subItems.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="flex items-baseline"
                >
                  <span className="mr-2  text-gray-400">
                    {item.subBulletIcon ? item.subBulletIcon : '-'}
                  </span>
                  <span className="text-base text-gray-600 ">{subItem}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormattedList;
