import React from 'react';
import './StatusIndicator.css';

const StatusIndicator = ({ 
  status, 
  size = 'medium', 
  showLabel = true, 
  animated = false,
  onClick = null 
}) => {
  const getStatusConfig = (status) => {
    const configs = {
      // Project Stages
      'Προγραμματισμός': {
        icon: '📋',
        color: '#6c757d',
        bgColor: '#f8f9fa',
        label: 'Προγραμματισμός',
        description: 'Αρχικός σχεδιασμός έργου'
      },
      'Ανάλυση Απαιτήσεων': {
        icon: '🔍',
        color: '#17a2b8',
        bgColor: '#d1ecf1',
        label: 'Ανάλυση',
        description: 'Καθορισμός απαιτήσεων'
      },
      'Σχεδιασμός': {
        icon: '✏️',
        color: '#ffc107',
        bgColor: '#fff3cd',
        label: 'Σχεδιασμός',
        description: 'Δημιουργία σχεδίων'
      },
      'Ανάπτυξη': {
        icon: '🔨',
        color: '#ff7700',
        bgColor: '#ffe8d1',
        label: 'Ανάπτυξη',
        description: 'Υλοποίηση έργου'
      },
      'Δοκιμές': {
        icon: '🧪',
        color: '#dc3545',
        bgColor: '#f8d7da',
        label: 'Δοκιμές',
        description: 'Έλεγχος ποιότητας'
      },
      'Παράδοση': {
        icon: '📦',
        color: '#28a745',
        bgColor: '#d4edda',
        label: 'Παράδοση',
        description: 'Παράδοση στον πελάτη'
      },
      'Ολοκληρωμένο': {
        icon: '✅',
        color: '#198754',
        bgColor: '#d1e7dd',
        label: 'Ολοκληρωμένο',
        description: 'Επιτυχής ολοκλήρωση'
      },
      'Συντήρηση': {
        icon: '⚙️',
        color: '#6f42c1',
        bgColor: '#e2d9f3',
        label: 'Συντήρηση',
        description: 'Διαρκής υποστήριξη'
      },
      
      // Health Status
      'on-track': {
        icon: '🟢',
        color: '#28a745',
        bgColor: '#d4edda',
        label: 'Εντάξει',
        description: 'Το έργο προχωρά κανονικά'
      },
      'behind': {
        icon: '🟡',
        color: '#ffc107',
        bgColor: '#fff3cd',
        label: 'Καθυστέρηση',
        description: 'Μικρή καθυστέρηση στο χρονοδιάγραμμα'
      },
      'at-risk': {
        icon: '🔴',
        color: '#dc3545',
        bgColor: '#f8d7da',
        label: 'Σε Κίνδυνο',
        description: 'Απαιτείται άμεση προσοχή'
      },
      'completed': {
        icon: '✅',
        color: '#198754',
        bgColor: '#d1e7dd',
        label: 'Ολοκληρωμένο',
        description: 'Επιτυχής ολοκλήρωση'
      },

      // Priority Status
      'low': {
        icon: '🔵',
        color: '#17a2b8',
        bgColor: '#d1ecf1',
        label: 'Χαμηλή',
        description: 'Χαμηλή προτεραιότητα'
      },
      'medium': {
        icon: '🟡',
        color: '#ffc107',
        bgColor: '#fff3cd',
        label: 'Μέτρια',
        description: 'Μέτρια προτεραιότητα'
      },
      'high': {
        icon: '🟠',
        color: '#fd7e14',
        bgColor: '#ffe5d0',
        label: 'Υψηλή',
        description: 'Υψηλή προτεραιότητα'
      },
      'critical': {
        icon: '🔴',
        color: '#dc3545',
        bgColor: '#f8d7da',
        label: 'Κρίσιμη',
        description: 'Κρίσιμη προτεραιότητα'
      }
    };
    
    return configs[status] || {
      icon: '❓',
      color: '#6c757d',
      bgColor: '#f8f9fa',
      label: status,
      description: 'Άγνωστη κατάσταση'
    };
  };

  const config = getStatusConfig(status);
  const sizeClass = `status-${size}`;
  const animatedClass = animated ? 'animated' : '';
  const clickableClass = onClick ? 'clickable' : '';

  return (
    <div 
      className={`status-indicator ${sizeClass} ${animatedClass} ${clickableClass}`}
      style={{
        '--status-color': config.color,
        '--status-bg': config.bgColor
      }}
      onClick={onClick}
      title={config.description}
    >
      <div className="status-icon">
        {config.icon}
      </div>
      {showLabel && (
        <div className="status-label">
          {config.label}
        </div>
      )}
      {animated && <div className="status-pulse"></div>}
    </div>
  );
};

export default StatusIndicator;