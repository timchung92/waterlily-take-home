export function OnboardingProgressBar({
  progressPercentage,
}: {
  progressPercentage: number;
}) {
  return (
    <div className="top-0 z-50 h-1 w-full bg-gray-200  md:h-1.5">
      <div
        className={`h-1 rounded-r-sm bg-mediumPurple transition-all duration-300 md:h-1.5`}
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
}
