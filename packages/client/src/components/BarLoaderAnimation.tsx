import React from 'react';
import BarLoader from 'react-spinners/BarLoader';

interface LoadingAnimationProps {
  loading: boolean;
  color?: string;
}

const BarLoaderAnimation: React.FC<LoadingAnimationProps> = ({
  loading,
  color,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-normal text-darkPurple">Waterlily</h2>
      <BarLoader
        width={125}
        color={color || '#120f3a'}
        loading={loading}
      />
    </div>
  );
};

export default BarLoaderAnimation;
