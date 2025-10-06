import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  value, 
  max = 100, 
  label = '', 
  showPercentage = true, 
  size = 'medium',
  color = 'primary',
  animated = true,
  striped = false,
  stages = null,
  currentStage = null
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getColorClass = (color) => {
    const colors = {
      'primary': 'progress-primary',
      'success': 'progress-success',
      'warning': 'progress-warning',
      'danger': 'progress-danger',
      'info': 'progress-info',
      'secondary': 'progress-secondary'
    };
    return colors[color] || 'progress-primary';
  };

  const getSizeClass = (size) => {
    const sizes = {
      'small': 'progress-small',
      'medium': 'progress-medium',
      'large': 'progress-large',
      'xl': 'progress-xl'
    };
    return sizes[size] || 'progress-medium';
  };

  const getProgressColor = () => {
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    if (percentage >= 40) return '#fd7e14';
    return '#dc3545';
  };

  return (
    <div className={`progress-container ${getSizeClass(size)}`}>
      {/* Progress Header */}
      {(label || showPercentage) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showPercentage && (
            <span className="progress-percentage" style={{ color: getProgressColor() }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Main Progress Bar */}
      <div className={`progress-bar ${getColorClass(color)} ${animated ? 'animated' : ''} ${striped ? 'striped' : ''}`}>
        <div 
          className="progress-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color === 'auto' ? getProgressColor() : undefined
          }}
        >
          {animated && <div className="progress-shine"></div>}
          {striped && <div className="progress-stripes"></div>}
        </div>
        
        {/* Progress Glow Effect */}
        {animated && (
          <div 
            className="progress-glow"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color === 'auto' ? getProgressColor() : undefined
            }}
          ></div>
        )}
      </div>

      {/* Stage Indicators */}
      {stages && (
        <div className="progress-stages">
          {stages.map((stage, index) => {
            const stagePercentage = ((index + 1) / stages.length) * 100;
            const isCompleted = percentage >= stagePercentage;
            const isCurrent = stage === currentStage;
            
            return (
              <div 
                key={stage}
                className={`stage-indicator ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                style={{ left: `${stagePercentage}%` }}
                title={stage}
              >
                <div className="stage-dot">
                  {isCompleted && <span className="stage-check">✓</span>}
                  {isCurrent && !isCompleted && <span className="stage-pulse"></span>}
                </div>
                <div className="stage-label">{stage}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Value Display */}
      {!showPercentage && value !== percentage && (
        <div className="progress-value">
          {value} / {max}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;