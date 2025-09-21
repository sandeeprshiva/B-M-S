import React from 'react';

// Simple Bar Chart Component
export const BarChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;

  const maxValue = Math.max(...data.map(item => item.value));
  const chartHeight = height - 60; // Reserve space for labels

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{title}</h3>}
      <div className="flex items-end justify-between gap-2" style={{ height: chartHeight }}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (chartHeight - 40) : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {item.value}
              </div>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${item.color || 'bg-blue-500'}`}
                style={{ height: `${barHeight}px`, minHeight: item.value > 0 ? '4px' : '0px' }}
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple Line Chart Component
export const LineChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;
  const chartHeight = height - 60;
  const chartWidth = 100; // percentage

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((item.value - minValue) / range) * (chartHeight - 20);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{title}</h3>}
      <div className="relative" style={{ height: chartHeight }}>
        <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={points}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((item.value - minValue) / range) * (chartHeight - 20);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Pie Chart Component
export const PieChart = ({ data, title, size = 200 }) => {
  if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="text-gray-500">No data to display</div>;

  let cumulativePercentage = 0;
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 2 * Math.PI - Math.PI / 2;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    cumulativePercentage += percentage;
    
    return {
      pathData,
      color: item.color || `hsl(${index * 360 / data.length}, 70%, 50%)`,
      percentage: percentage.toFixed(1),
      label: item.label,
      value: item.value
    };
  });

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{title}</h3>}
      <div className="flex items-center justify-center gap-8">
        <svg width={size} height={size} className="drop-shadow-sm">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {slice.label}: {slice.percentage}% ({slice.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
export const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = '#3B82F6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-800 dark:text-white">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};
