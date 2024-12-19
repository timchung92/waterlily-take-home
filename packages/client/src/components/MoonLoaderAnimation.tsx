import React from 'react';
import MoonLoader from 'react-spinners/MoonLoader';
import styles from './MoonLoader.module.css';
import classnames from 'classnames';

interface LoadingAnimationProps {
  loading: boolean;
  color?: string;
  size?: number;
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  loading,
  color,
  size,
  className,
}) => {
  return (
    <div className={classnames(className, styles.loadingAnimationContainer)}>
      <MoonLoader
        color={color || '#120f3a'}
        size={size || 50}
        loading={loading}
      />
    </div>
  );
};

export default LoadingAnimation;
