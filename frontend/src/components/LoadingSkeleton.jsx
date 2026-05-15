const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="loading-skeleton h-4"
          style={{
            width: `${Math.max(40, 100 - i * 15)}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="loading-skeleton h-6 w-1/3" />
    <LoadingSkeleton lines={3} />
    <div className="loading-skeleton h-10 w-full rounded-xl" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6 flex flex-col items-center gap-4">
    <div className="loading-skeleton w-40 h-40 rounded-full" />
    <div className="loading-skeleton h-5 w-24" />
  </div>
);

export default LoadingSkeleton;
