import MoonLoader from 'react-spinners/MoonLoader';

type LoadingStateProps = {
  isLoading?: boolean;
  loadingSpinnerSizePixels?: number;
  loadingSpinnerColor?: string;
};
export function LoadingState({
  isLoading,
  loadingSpinnerSizePixels = 50,
  loadingSpinnerColor = '#120f3a',
}: LoadingStateProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-500 bg-opacity-40">
      <MoonLoader
        size={loadingSpinnerSizePixels}
        color={loadingSpinnerColor}
      />
    </div>
  );
}
