import React from 'react';
import './MiniCharts.css';

const MiniChart = ({ 
  type = 'donut', 
  data = [], 
  size = 60, 
  strokeWidth = 6,
  showLabel = true,
  animated = true,
  colors = ['#ff7700', '#28a745', '#ffc107', '#dc3545', '#17a2b8']
}) => {
  
  const renderDonutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercentage = 0;

    return (
      <div className="mini-chart-container" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="donut-chart">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
            const color = colors[index % colors.length];
            
            cumulativePercentage += percentage;

            return (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={animated ? 'animated-stroke' : ''}
                style={{
                  transformOrigin: `${size / 2}px ${size / 2}px`,
                  transform: 'rotate(-90deg)'
                }}
              />
            );
          })}
        </svg>
        
        {showLabel && (
          <div className="chart-center-label">
            <div className="chart-total">{total}</div>
            <div className="chart-unit">Total</div>
          </div>
        )}
      </div>
    );
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(item => item.value));
    if (maxValue === 0) return null;

    return (
      <div className="mini-bar-chart" style={{ height: size }}>
        {data.map((item, index) => {
          const height = (item.value / maxValue) * (size - 20);
          const color = colors[index % colors.length];
          
          return (
            <div key={item.label} className="bar-item">
              <div 
                className="bar"
                style={{ 
                  height: `${height}px`,
                  backgroundColor: color
                }}
                title={`${item.label}: ${item.value}`}
              ></div>
              {showLabel && (
                <div className="bar-label">{item.label}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    if (data.length < 2) return null;
    
    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const range = maxValue - minValue || 1;
    const stepX = size / (data.length - 1);
    
    let pathData = '';
    const points = data.map((item, index) => {
      const x = index * stepX;
      const y = size - ((item.value - minValue) / range) * (size - 20) - 10;
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
      return { x, y, value: item.value, label: item.label };
    });

    return (
      <div className="mini-line-chart" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <path
            d={pathData}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            className={animated ? 'animated-path' : ''}
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={colors[0]}
              className={animated ? 'animated-point' : ''}
              title={`${point.label}: ${point.value}`}
            />
          ))}
        </svg>
      </div>
    );
  };

  const renderSparkline = () => {
    if (data.length < 2) return null;
    
    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const range = maxValue - minValue || 1;
    const stepX = size / (data.length - 1);
    
    const points = data.map((item, index) => {
      const x = index * stepX;
      const y = ((maxValue - item.value) / range) * (size - 4) + 2;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mini-sparkline" style={{ width: size, height: 30 }}>
        <svg width={size} height="30" className="sparkline-svg">
          <polyline
            points={points}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            className={animated ? 'animated-sparkline' : ''}
          />
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'donut':
        return renderDonutChart();
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'sparkline':
        return renderSparkline();
      default:
        return renderDonutChart();
    }
  };

  return (
    <div className={`mini-chart ${type}-chart ${animated ? 'animated' : ''}`}>
      {renderChart()}
    </div>
  );
};

export default MiniChart;